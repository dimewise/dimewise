package web

import (
	"context"
	"errors"
	"net/http"

	"dimewise/generated/oapi"
	"dimewise/internal/middleware"
	"dimewise/internal/repository"
	"dimewise/internal/service"
)

// ListReports handles GET /reports.
func (h *Handler) ListReports(
	ctx context.Context,
	_ oapi.ListReportsRequestObject,
) (oapi.ListReportsResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.ListReports401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(http.StatusUnauthorized, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	reports, err := h.reportService.List(ctx, user.ID)
	if err != nil {
		return mapReportListError(err)
	}

	result := make(oapi.ListReports200JSONResponse, 0, len(reports))
	for i := range reports {
		result = append(result, reportListItemToAPI(&reports[i]))
	}

	return result, nil
}

// GetReport handles GET /reports/{month}/{year}.
func (h *Handler) GetReport(
	ctx context.Context,
	request oapi.GetReportRequestObject,
) (oapi.GetReportResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.GetReport401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(http.StatusUnauthorized, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	report, err := h.reportService.GetReport(ctx, user.ID, request.Month, request.Year)
	if err != nil {
		return mapReportGetError(err)
	}

	return oapi.GetReport200JSONResponse(dynamicReportToAPI(report)), nil
}

// CloseReport handles POST /reports/{month}/{year}/close.
func (h *Handler) CloseReport(
	ctx context.Context,
	request oapi.CloseReportRequestObject,
) (oapi.CloseReportResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.CloseReport401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(http.StatusUnauthorized, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	closedAt, err := h.reportService.CloseReport(ctx, user.ID, request.Month, request.Year)
	if err != nil {
		return mapReportCloseError(err)
	}

	return oapi.CloseReport200JSONResponse{
		Month:    request.Month,
		Year:     request.Year,
		ClosedAt: closedAt,
	}, nil
}

// ReopenReport handles POST /reports/{month}/{year}/reopen.
func (h *Handler) ReopenReport(
	ctx context.Context,
	request oapi.ReopenReportRequestObject,
) (oapi.ReopenReportResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.ReopenReport401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(http.StatusUnauthorized, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	if err := h.reportService.ReopenReport(ctx, user.ID, request.Month, request.Year); err != nil {
		return mapReportReopenError(err)
	}

	return oapi.ReopenReport200JSONResponse{
		Month: request.Month,
		Year:  request.Year,
	}, nil
}

// --- Type mappers ---

func reportListItemToAPI(r *repository.ReportListItem) oapi.ReportListItem {
	return oapi.ReportListItem{
		Month:         int(r.Month),
		Year:          int(r.Year),
		TotalExpenses: int(r.TotalExpenses),
		TotalAmount:   r.TotalAmount,
		ClosedAt:      r.ClosedAt,
	}
}

func dynamicReportToAPI(r *service.DynamicReport) oapi.ReportWithDetails {
	members := make([]oapi.ReportMemberSummary, 0, len(r.MemberSummaries))
	for _, ms := range r.MemberSummaries {
		members = append(members, oapi.ReportMemberSummary{
			UserId:     ms.UserID,
			MemberName: ms.MemberName,
			TotalPaid:  ms.TotalPaid,
			TotalOwed:  ms.TotalOwed,
			NetBalance: ms.NetBalance,
		})
	}

	categories := make([]oapi.ReportCategoryBreakdown, 0, len(r.CategoryBreakdowns))
	for _, cb := range r.CategoryBreakdowns {
		categories = append(categories, oapi.ReportCategoryBreakdown{
			CategoryName: cb.CategoryName,
			BudgetAmount: cb.BudgetAmount,
			TotalSpent:   cb.TotalSpent,
		})
	}

	lineItems := make([]oapi.ReportLineItem, 0, len(r.LineItems))
	for _, li := range r.LineItems {
		splits := make([]oapi.ReportLineItemSplit, 0, len(li.Splits))
		for _, s := range li.Splits {
			splits = append(splits, oapi.ReportLineItemSplit{
				UserId:     s.UserID,
				MemberName: s.MemberName,
				Amount:     s.Amount,
			})
		}

		lineItems = append(lineItems, oapi.ReportLineItem{
			ExpenseId:    li.ExpenseID,
			ExpenseTitle: li.ExpenseTitle,
			CategoryName: li.CategoryName,
			PaidByUserId: li.PaidByUserID,
			PaidByName:   li.PaidByName,
			Amount:       li.Amount,
			IncurredAt:   li.IncurredAt,
			Notes:        li.Notes,
			Splits:       splits,
		})
	}

	return oapi.ReportWithDetails{
		Month:              r.Month,
		Year:               r.Year,
		TotalExpenses:      r.TotalExpenses,
		TotalAmount:        r.TotalAmount,
		ClosedAt:           r.ClosedAt,
		MemberSummaries:    members,
		CategoryBreakdowns: categories,
		LineItems:          lineItems,
		Trends:             trendsResultToAPI(r.Trends),
		Settlements:        settlementsToAPI(r.Settlements),
	}
}

func settlementsToAPI(s *service.Settlements) *oapi.ReportSettlements {
	if s == nil {
		return nil
	}

	greedy := make([]oapi.ReportSettlementTransfer, 0, len(s.Greedy))
	for _, t := range s.Greedy {
		greedy = append(greedy, oapi.ReportSettlementTransfer{
			FromUserId: t.FromUserID,
			FromName:   t.FromName,
			ToUserId:   t.ToUserID,
			ToName:     t.ToName,
			Amount:     t.Amount,
		})
	}

	direct := make([]oapi.ReportSettlementTransfer, 0, len(s.Direct))
	for _, t := range s.Direct {
		direct = append(direct, oapi.ReportSettlementTransfer{
			FromUserId: t.FromUserID,
			FromName:   t.FromName,
			ToUserId:   t.ToUserID,
			ToName:     t.ToName,
			Amount:     t.Amount,
		})
	}

	return &oapi.ReportSettlements{
		Greedy: greedy,
		Direct: direct,
	}
}

func trendsResultToAPI(r *service.TrendsResult) oapi.ReportTrends {
	if r == nil {
		return oapi.ReportTrends{
			Months:         []oapi.MonthlySpend{},
			CategoryTrends: []oapi.CategoryTrend{},
			MemberTrends:   []oapi.MemberTrend{},
		}
	}

	months := make([]oapi.MonthlySpend, 0, len(r.Months))
	for _, m := range r.Months {
		months = append(months, oapi.MonthlySpend{
			Month:         int(m.Month),
			Year:          int(m.Year),
			TotalAmount:   m.TotalAmount,
			TotalExpenses: int(m.TotalExpenses),
		})
	}

	catTrends := make([]oapi.CategoryTrend, 0, len(r.CategoryTrends))
	for name, rows := range r.CategoryTrends {
		points := make([]oapi.CategoryTrendPoint, 0, len(rows))
		for _, row := range rows {
			points = append(points, oapi.CategoryTrendPoint{
				Month:        int(row.Month),
				Year:         int(row.Year),
				TotalSpent:   row.TotalSpent,
				BudgetAmount: row.BudgetAmount,
			})
		}

		catTrends = append(catTrends, oapi.CategoryTrend{
			CategoryName: name,
			Data:         points,
		})
	}

	memberTrends := make([]oapi.MemberTrend, 0, len(r.MemberTrends))
	for uid, tm := range r.MemberTrends {
		points := make([]oapi.MemberTrendPoint, 0, len(tm.Data))
		for _, row := range tm.Data {
			points = append(points, oapi.MemberTrendPoint{
				Month:     int(row.Month),
				Year:      int(row.Year),
				TotalPaid: row.TotalPaid,
			})
		}

		memberTrends = append(memberTrends, oapi.MemberTrend{
			UserId:     uid,
			MemberName: tm.MemberName,
			Data:       points,
		})
	}

	return oapi.ReportTrends{
		Months:         months,
		CategoryTrends: catTrends,
		MemberTrends:   memberTrends,
	}
}

// --- Error mappers ---

func mapReportListError(
	err error,
) (oapi.ListReportsResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrNotFound:
		return oapi.ListReports404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(http.StatusNotFound, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapReportGetError(
	err error,
) (oapi.GetReportResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrForbidden:
		return oapi.GetReport404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(http.StatusNotFound, "Not Found", svcErr.Message),
			),
		}, nil
	case service.ErrNotFound:
		return oapi.GetReport404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(http.StatusNotFound, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapReportCloseError(
	err error,
) (oapi.CloseReportResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrForbidden:
		return oapi.CloseReport403ApplicationProblemPlusJSONResponse{
			ForbiddenApplicationProblemPlusJSONResponse: oapi.ForbiddenApplicationProblemPlusJSONResponse(
				newProblem(http.StatusForbidden, "Forbidden", svcErr.Message),
			),
		}, nil
	case service.ErrNotFound:
		return oapi.CloseReport404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(http.StatusNotFound, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapReportReopenError(
	err error,
) (oapi.ReopenReportResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrForbidden:
		return oapi.ReopenReport403ApplicationProblemPlusJSONResponse{
			ForbiddenApplicationProblemPlusJSONResponse: oapi.ForbiddenApplicationProblemPlusJSONResponse(
				newProblem(http.StatusForbidden, "Forbidden", svcErr.Message),
			),
		}, nil
	case service.ErrNotFound:
		return oapi.ReopenReport404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(http.StatusNotFound, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}
