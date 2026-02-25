package web

import (
	"context"
	"errors"

	"github.com/google/uuid"

	"dimewise/generated/dimewise/public/model"
	"dimewise/generated/oapi"
	"dimewise/internal/middleware"
	"dimewise/internal/repository"
	"dimewise/internal/service"
)

// ListReports handles GET /reports
func (h *Handler) ListReports(
	ctx context.Context,
	_ oapi.ListReportsRequestObject,
) (oapi.ListReportsResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.ListReports401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(401, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	reports, err := h.reportService.List(ctx, user.ID)
	if err != nil {
		return mapReportListError(err)
	}

	result := make(oapi.ListReports200JSONResponse, 0, len(reports))
	for i := range reports {
		result = append(result, reportToAPI(&reports[i]))
	}

	return result, nil
}

// GenerateReport handles POST /reports/generate
func (h *Handler) GenerateReport(
	ctx context.Context,
	request oapi.GenerateReportRequestObject,
) (oapi.GenerateReportResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.GenerateReport401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(401, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	created, err := h.reportService.Generate(
		ctx,
		user.ID,
		request.Body.Month,
		request.Body.Year,
	)
	if err != nil {
		return mapReportGenerateError(err)
	}

	return oapi.GenerateReport201JSONResponse(reportWithDetailsToAPI(created)), nil
}

// GetReport handles GET /reports/{reportId}
func (h *Handler) GetReport(
	ctx context.Context,
	request oapi.GetReportRequestObject,
) (oapi.GetReportResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.GetReport401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(401, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	reportID, err := uuid.Parse(request.ReportId.String())
	if err != nil {
		return oapi.GetReport404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(404, "Not Found", "invalid report ID"),
			),
		}, nil
	}

	report, err := h.reportService.GetByID(ctx, user.ID, reportID)
	if err != nil {
		return mapReportGetError(err)
	}

	return oapi.GetReport200JSONResponse(reportWithDetailsToAPI(report)), nil
}

// MarkReportTransferPaid handles PATCH /reports/transfers/{transferId}/pay
func (h *Handler) MarkReportTransferPaid(
	ctx context.Context,
	request oapi.MarkReportTransferPaidRequestObject,
) (oapi.MarkReportTransferPaidResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.MarkReportTransferPaid401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(401, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	transferID, err := uuid.Parse(request.TransferId.String())
	if err != nil {
		return oapi.MarkReportTransferPaid404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(404, "Not Found", "invalid transfer ID"),
			),
		}, nil
	}

	transfer, err := h.reportService.MarkTransferPaid(ctx, user.ID, transferID)
	if err != nil {
		return mapReportTransferPaidError(err)
	}

	return oapi.MarkReportTransferPaid200JSONResponse(reportTransferToAPI(transfer)), nil
}

// --- Type mappers ---

func reportToAPI(r *model.Reports) oapi.Report {
	return oapi.Report{
		Id:            r.ID,
		CreatedAt:     r.CreatedAt,
		UpdatedAt:     r.UpdatedAt,
		HouseholdId:   r.HouseholdID,
		Month:         int(r.Month),
		Year:          int(r.Year),
		TotalExpenses: int(r.TotalExpenses),
		TotalAmount:   r.TotalAmount,
		GeneratedAt:   r.GeneratedAt,
	}
}

func reportTransferToAPI(t *model.ReportTransfers) oapi.ReportTransfer {
	reportID := t.ReportID

	return oapi.ReportTransfer{
		Id:         t.ID,
		ReportId:   &reportID,
		FromUserId: t.FromUserID,
		ToUserId:   t.ToUserID,
		FromName:   t.FromName,
		ToName:     t.ToName,
		Amount:     t.Amount,
		PaidAt:     t.PaidAt,
	}
}

func reportMemberSummaryToAPI(ms *model.ReportMemberSummaries) oapi.ReportMemberSummary {
	return oapi.ReportMemberSummary{
		Id:         ms.ID,
		UserId:     ms.UserID,
		MemberName: ms.MemberName,
		TotalPaid:  ms.TotalPaid,
		TotalOwed:  ms.TotalOwed,
		NetBalance: ms.NetBalance,
	}
}

func reportCategoryBreakdownToAPI(cb *model.ReportCategoryBreakdowns) oapi.ReportCategoryBreakdown {
	return oapi.ReportCategoryBreakdown{
		Id:           cb.ID,
		CategoryName: cb.CategoryName,
		BudgetAmount: cb.BudgetAmount,
		TotalSpent:   cb.TotalSpent,
	}
}

func reportLineItemToAPI(li *repository.ReportLineItemWithSplits) oapi.ReportLineItem {
	splits := make([]oapi.ReportLineItemSplit, 0, len(li.Splits))
	for i := range li.Splits {
		splits = append(splits, oapi.ReportLineItemSplit{
			Id:         li.Splits[i].ID,
			UserId:     li.Splits[i].UserID,
			MemberName: li.Splits[i].MemberName,
			Amount:     li.Splits[i].Amount,
		})
	}

	return oapi.ReportLineItem{
		Id:           li.ID,
		ExpenseId:    li.ExpenseID,
		ExpenseTitle: li.ExpenseTitle,
		CategoryName: li.CategoryName,
		PaidByUserId: li.PaidByUserID,
		PaidByName:   li.PaidByName,
		Amount:       li.Amount,
		IncurredAt:   li.IncurredAt,
		Notes:        li.Notes,
		Splits:       splits,
	}
}

func reportWithDetailsToAPI(r *repository.ReportWithDetails) oapi.ReportWithDetails {
	members := make([]oapi.ReportMemberSummary, 0, len(r.MemberSummaries))
	for i := range r.MemberSummaries {
		members = append(members, reportMemberSummaryToAPI(&r.MemberSummaries[i]))
	}

	categories := make([]oapi.ReportCategoryBreakdown, 0, len(r.CategoryBreakdowns))
	for i := range r.CategoryBreakdowns {
		categories = append(categories, reportCategoryBreakdownToAPI(&r.CategoryBreakdowns[i]))
	}

	lineItems := make([]oapi.ReportLineItem, 0, len(r.LineItems))
	for i := range r.LineItems {
		lineItems = append(lineItems, reportLineItemToAPI(&r.LineItems[i]))
	}

	transfers := make([]oapi.ReportTransfer, 0, len(r.Transfers))
	for i := range r.Transfers {
		transfers = append(transfers, reportTransferToAPI(&r.Transfers[i]))
	}

	return oapi.ReportWithDetails{
		Id:                 r.ID,
		CreatedAt:          r.CreatedAt,
		UpdatedAt:          r.UpdatedAt,
		HouseholdId:        r.HouseholdID,
		Month:              int(r.Month),
		Year:               int(r.Year),
		TotalExpenses:      int(r.TotalExpenses),
		TotalAmount:        r.TotalAmount,
		GeneratedAt:        r.GeneratedAt,
		MemberSummaries:    members,
		CategoryBreakdowns: categories,
		LineItems:          lineItems,
		Transfers:          transfers,
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
				newProblem(404, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapReportGenerateError(
	err error,
) (oapi.GenerateReportResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrBadRequest:
		return oapi.GenerateReport400ApplicationProblemPlusJSONResponse{
			BadRequestApplicationProblemPlusJSONResponse: oapi.BadRequestApplicationProblemPlusJSONResponse(
				newProblem(400, "Bad Request", svcErr.Message),
			),
		}, nil
	case service.ErrNotFound:
		return oapi.GenerateReport404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(404, "Not Found", svcErr.Message),
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
				newProblem(404, "Not Found", svcErr.Message),
			),
		}, nil
	case service.ErrNotFound:
		return oapi.GetReport404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(404, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapReportTransferPaidError(
	err error,
) (oapi.MarkReportTransferPaidResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrForbidden:
		return oapi.MarkReportTransferPaid403ApplicationProblemPlusJSONResponse{
			ForbiddenApplicationProblemPlusJSONResponse: oapi.ForbiddenApplicationProblemPlusJSONResponse(
				newProblem(403, "Forbidden", svcErr.Message),
			),
		}, nil
	case service.ErrNotFound:
		return oapi.MarkReportTransferPaid404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(404, "Not Found", svcErr.Message),
			),
		}, nil
	case service.ErrConflict:
		return oapi.MarkReportTransferPaid403ApplicationProblemPlusJSONResponse{
			ForbiddenApplicationProblemPlusJSONResponse: oapi.ForbiddenApplicationProblemPlusJSONResponse(
				newProblem(403, "Forbidden", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}
