package middleware

import (
	"encoding/json"
	"log/slog"
	"net/http"

	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/teoyi/dimewise/config"
)

func UserCheck(app *config.App) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			claims := r.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
			claimsJSON, err := json.Marshal(claims)
			if err != nil {
				http.Error(w, "Error marshaling claims to JSON", http.StatusInternalServerError)
				return
			}
			slog.Info("Claims here: ", string(claimsJSON))
			next.ServeHTTP(w, r)
		}

		return http.HandlerFunc(fn)
	}
}
