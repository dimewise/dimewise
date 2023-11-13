package middleware

import (
	"errors"
	"log/slog"
	"net/http"

	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/teoyi/dimewise/internal/domain"
	"github.com/teoyi/dimewise/internal/repository"
	lerrors "github.com/teoyi/dimewise/internal/util/errors"
)

func UserCheck(re *repository.Repository) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			claims, _ := r.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
			subject := claims.RegisteredClaims.Subject
			account, err := re.Account.GetAccountByExternalID(subject)
			if err != nil {
				if errors.Is(err, lerrors.ErrResourceNotFound) {
					slog.Debug("account not found, creating new one ")
					// create new account
					model := domain.CreateAccountByExternalID(subject)
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
					next.ServeHTTP(w, r)
				}

				slog.Error("Error checking for account", slog.Any("err", err))
				http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
				return
			}

			slog.Debug("account found", slog.String("id", account.ID.String()))

			next.ServeHTTP(w, r)
		}

		return http.HandlerFunc(fn)
	}
}
