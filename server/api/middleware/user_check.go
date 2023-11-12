package middleware

import (
	"log"
	"net/http"

	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/teoyi/dimewise/config"
)

func UserCheck(_ *config.App) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			claims, _ := r.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)

			// add checks here for accounts, if missing craete a record in db
			log.Println(claims.RegisteredClaims.Subject)
			next.ServeHTTP(w, r)
		}

		return http.HandlerFunc(fn)
	}
}
