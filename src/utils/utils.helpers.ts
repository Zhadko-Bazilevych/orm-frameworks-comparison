import { BaseResponse } from 'src/utils/utils.types';

export async function measureTime<TCallback extends () => Promise<unknown>>(
  cb: TCallback,
): Promise<BaseResponse<Awaited<ReturnType<TCallback>>>> {
  const start = performance.now();
  const result = (await cb()) as Awaited<ReturnType<TCallback>>;
  const end = performance.now();

  return {
    data: result,
    timeMs: end - start,
  };
}
