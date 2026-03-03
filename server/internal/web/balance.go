package web

import (
	"context"
	"errors"
	"net/http"

	"dimewise/generated/oapi"
	"dimewise/internal/middleware"
	"dimewise/internal/service"
)

// GetMyBalances handles GET /balances/me.
func (h *Handler) GetMyBalances(
	ctx context.Context,
	request oapi.GetMyBalancesRequestObject,
) (oapi.GetMyBalancesResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.GetMyBalances401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(http.StatusUnauthorized, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	var month, year int
	if request.Params.Month != nil {
		month = *request.Params.Month
	}

	if request.Params.Year != nil {
		year = *request.Params.Year
	}

	summary, err := h.balanceService.GetMyBalances(ctx, user.ID, month, year)
	if err != nil {
		return mapBalanceError(err)
	}

	balances := make([]oapi.MemberBalance, 0, len(summary.Balances))
	for _, b := range summary.Balances {
		balances = append(balances, oapi.MemberBalance{
			UserId:     b.UserID,
			MemberName: b.MemberName,
			Amount:     b.Amount,
		})
	}

	return oapi.GetMyBalances200JSONResponse(oapi.BalanceSummary{
		Month:      summary.Month,
		Year:       summary.Year,
		NetBalance: summary.NetBalance,
		Balances:   balances,
	}), nil
}

func mapBalanceError(
	err error,
) (oapi.GetMyBalancesResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrNotFound:
		return oapi.GetMyBalances404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(http.StatusNotFound, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}
