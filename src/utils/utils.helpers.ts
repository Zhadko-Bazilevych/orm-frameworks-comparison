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

export function sumExplainTimes(...explains: { 'QUERY PLAN': string }[][]) {
  let totalPlanning = 0;
  let totalExecution = 0;

  for (const explain of explains) {
    for (const line of explain) {
      const text = line['QUERY PLAN'];
      const planMatch = text.match(/Planning Time: ([\d.]+) ms/);
      if (planMatch) totalPlanning += parseFloat(planMatch[1]);

      const execMatch = text.match(/Execution Time: ([\d.]+) ms/);
      if (execMatch) totalExecution += parseFloat(execMatch[1]);
    }
  }

  return [
    { 'QUERY PLAN': `Planning Time: ${totalPlanning.toFixed(3)} ms` },
    { 'QUERY PLAN': `Execution Time: ${totalExecution.toFixed(3)} ms` },
  ];
}
