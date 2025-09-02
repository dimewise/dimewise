package middleware

import (
	"context"
	"net/http"

	"github.com/dimewise/dimewise/config"
	"github.com/dimewise/dimewise/generated/dimewise/public/model"
	"github.com/dimewise/dimewise/internal/app/repository"
)

// NewLoadAppUserMiddleware attaches the app user model into the request context.
// If user is not found, it returns a 401 Unauthorized and blocks the request.
// NOTE: Clerk Auth Middleware should be loaded before this middleware.
func NewLoadAppUserMiddleware(c *config.Config) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			clerkUser, ok := GetClerkUserFromContext(r.Context())
			if !ok {
				http.Error(
					w,
					"Unauthorized: missing authenticated clerk user",
					http.StatusUnauthorized,
				)
				return
			}

			appUser, err := repository.GetUserByClerkID(r.Context(), c.DB(), clerkUser.ID)
			if err != nil {
				http.Error(w, "Unauthorized: failed to find user", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), appAuthUserKey, appUser)
			r = r.WithContext(ctx)
			next.ServeHTTP(w, r)
		}

		return http.HandlerFunc(fn)
	}
}

// GetAppUserFromContext retrieves the authenticated user from context.
func GetAppUserFromContext(ctx context.Context) (*model.User, bool) {
	appUser, ok := ctx.Value(appAuthUserKey).(*model.User)
	return appUser, ok
}
