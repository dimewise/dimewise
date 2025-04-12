export type GenericResponse<TData, TError> = {
  data: TData | null;
  error: TError | null;
};
