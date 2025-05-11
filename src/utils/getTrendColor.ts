export const getTrendColor_Range = (
  value: number,
  min: number,
  max: number,
  reverse: boolean = false
) => {
  const median = (max - min) / 2 + min;

  if (!reverse && value > median) {
    const x = ((value - median) / (max - median)) * 255;

    return {
      color: `rgb(${255 - x}, ${255}, ${255 - x})`,
    };
  } else if (!reverse && value < median) {
    const x = ((median - value) / (median - min)) * 255;

    if (value === -879) console.log({ x });
    return {
      color: `rgb(${255}, ${255 - x}, ${255 - x})`,
    };
  } else if (reverse && value < median) {
    const x = ((median - value) / (median - min)) * 255;

    return {
      color: `rgb(${255 - x}, ${255}, ${255 - x})`,
    };
  } else if (reverse && value > median) {
    const x = ((value - median) / (max - median)) * 255;

    return {
      color: `rgb(${255}, ${255 - x}, ${255 - x})`,
    };
  } else {
    return {
      color: `rgb(255, 255, 255)`,
    };
  }
};
