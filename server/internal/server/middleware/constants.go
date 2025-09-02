package middleware

type contextKey string

const (
	clerkAuthUserKey contextKey = "clerk_auth_user"
	appAuthUserKey   contextKey = "app_auth_user"
)
