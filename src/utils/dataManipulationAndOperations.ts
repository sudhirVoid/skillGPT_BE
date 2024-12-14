export const  splitByPeriodAndCombineIndexes = (text: string): string=> {
    const segments: string[] = text.split('.');
    const selectedSegments: string[] = segments.filter((_, index) => index % 4 === 0);
    return selectedSegments.map(segment => segment.trim()).join('. ') + '.';
  }