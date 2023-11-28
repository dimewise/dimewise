package middleware

import (
	"context"
	"errors"
	"log/slog"
	"net/http"

	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/teoyi/dimewise/db/dimewise/public/model"
	"github.com/teoyi/dimewise/internal/domain"
	"github.com/teoyi/dimewise/internal/dto"
	"github.com/teoyi/dimewise/internal/repository"
	lerrors "github.com/teoyi/dimewise/internal/util/errors"
)

type authCtxKeyType int

var authCtxKey authCtxKeyType //nolint: gochecknoglobals // non-exported but required for handling context

func UserCheck(re *repository.Repository) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			claims, _ := r.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
			customClaims, _ := claims.CustomClaims.(*AuthClaims)

			externalID := claims.RegisteredClaims.Subject
			email := customClaims.Email

			account, err := re.Account.GetAccountByExternalIDOrEmail(externalID, email)
			if err != nil {
				if errors.Is(err, lerrors.ErrResourceNotFound) {
					slog.Debug("account not found, creating new one ")
					// create new account
					model := domain.CreateAccountByExternalIDAndEmail(externalID, email)
					createdAccount, createErr := re.Account.CreateAccountByModel(model)
					if createErr != nil {
						slog.Error("Error creating account", slog.Any("err", createErr))
						http.Error(
							w,
							http.StatusText(http.StatusUnauthorized),
							http.StatusUnauthorized,
						)
						return
					}

					slog.Debug("account created", slog.String("id", createdAccount.ID.String()))

					authInfoDto := parseAccountInfoToAuthInfoDto(createdAccount)
					authCtx := context.WithValue(r.Context(), authCtxKey, authInfoDto)
					next.ServeHTTP(w, r.WithContext(authCtx))
				}

				slog.Error("Error checking for account", slog.Any("err", err))
				http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
				return
			}

			slog.Debug("account found", slog.String("id", account.ID.String()))
			authInfoDto := parseAccountInfoToAuthInfoDto(account)
			authCtx := context.WithValue(r.Context(), authCtxKey, authInfoDto)

			next.ServeHTTP(w, r.WithContext(authCtx))
		}

		return http.HandlerFunc(fn)
	}
}

func AuthFromContext(ctx context.Context) *dto.AuthInfoDto {
	a, ok := ctx.Value(authCtxKey).(*dto.AuthInfoDto)
	if !ok {
		panic(errors.New("authentication missing from context"))
	}
	return a
}

func parseAccountInfoToAuthInfoDto(account *model.Account) *dto.AuthInfoDto {
	dto := dto.AuthInfoDto{
		ID:         account.ID,
		ExternalID: account.ExternalID,
	}

	return &dto
}
