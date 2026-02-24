package middleware

import (
	"context"
	"log/slog"
	"net/http"

	"github.com/clerk/clerk-sdk-go/v2"
	clerkhttp "github.com/clerk/clerk-sdk-go/v2/http"
	"github.com/clerk/clerk-sdk-go/v2/user"

	"dimewise/generated/dimewise/public/model"
	"dimewise/internal/service"
)

type contextKey string

const (
	clerkAuthUserKey contextKey = "clerk_auth_user"
	appUserKey       contextKey = "app_user"
)

// NewClerkAuthMiddleware verifies the Clerk JWT, fetches the Clerk user,
// upserts them into the app database, and stores the app user in context.
func NewClerkAuthMiddleware(userService *service.UserService) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			handler := clerkhttp.WithHeaderAuthorization()(
				http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					claims, ok := clerk.SessionClaimsFromContext(r.Context())
					if !ok {
						http.Error(
							w,
							"Unauthorized: missing or invalid session claims",
							http.StatusUnauthorized,
						)
						return
					}

					clerkUser, err := user.Get(r.Context(), claims.Subject)
					if err != nil {
						slog.Default().
							ErrorContext(r.Context(), "failed to get user from Clerk",
								slog.String("claims_subject", claims.Subject),
								slog.Any("clerk_err", err),
							)
						http.Error(
							w,
							"Unauthorized: failed to get authenticated user",
							http.StatusUnauthorized,
						)
						return
					}

					// Extract profile data from Clerk
					email := ""
					if len(clerkUser.EmailAddresses) > 0 {
						email = clerkUser.EmailAddresses[0].EmailAddress
					}

					var firstName, lastName, avatarURL *string
					if clerkUser.FirstName != nil && *clerkUser.FirstName != "" {
						firstName = clerkUser.FirstName
					}
					if clerkUser.LastName != nil && *clerkUser.LastName != "" {
						lastName = clerkUser.LastName
					}
					if clerkUser.ImageURL != nil && *clerkUser.ImageURL != "" {
						avatarURL = clerkUser.ImageURL
					}

					// Upsert user into our database
					appUser, err := userService.UpsertFromClerk(
						r.Context(),
						clerkUser.ID,
						email,
						firstName,
						lastName,
						avatarURL,
					)
					if err != nil {
						slog.Default().
							ErrorContext(r.Context(), "failed to upsert user",
								slog.String("clerk_id", clerkUser.ID),
								slog.Any("err", err),
							)
						http.Error(
							w,
							"Internal Server Error",
							http.StatusInternalServerError,
						)
						return
					}

					ctx := context.WithValue(r.Context(), clerkAuthUserKey, clerkUser)
					ctx = context.WithValue(ctx, appUserKey, appUser)
					r = r.WithContext(ctx)

					next.ServeHTTP(w, r)
				}),
			)
			handler.ServeHTTP(w, r)
		}
		return http.HandlerFunc(fn)
	}
}

// GetClerkUserFromContext retrieves the authenticated Clerk user from context.
func GetClerkUserFromContext(ctx context.Context) (*clerk.User, bool) {
	authUser, ok := ctx.Value(clerkAuthUserKey).(*clerk.User)
	return authUser, ok
}

// GetAppUserFromContext retrieves the app user (from our database) from context.
func GetAppUserFromContext(ctx context.Context) (*model.Users, bool) {
	appUser, ok := ctx.Value(appUserKey).(*model.Users)
	return appUser, ok
}
