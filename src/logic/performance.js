/**
 * Financial logic for Time-Weighted Return (TWR) and Money-Weighted Return (MWR)
 */

export const INITIAL_UNIT_PRICE = 10000;

/**
 * Calculate the new state after a cash flow (Initial NAV change)
 * Total Units = Prev Units + (Cash Flow / Current Unit Price)
 */
export function calculateNewUnits(prevNav, prevUnits, currentNav, newInitialNav, oldInitialNav) {
  const cashFlow = newInitialNav - oldInitialNav;
  const currentUnitPrice = prevUnits > 0 ? (currentNav / prevUnits) : INITIAL_UNIT_PRICE;
  
  const additionalUnits = cashFlow / currentUnitPrice;
  const totalUnits = (prevUnits || 0) + additionalUnits;
  
  return {
    totalUnits,
    unitPrice: currentUnitPrice
  };
}

/**
 * Logic to calculate returns for chart
 * Base Date point is always 100% (or 0% gain)
 */
export function calculatePerformance(history, method = 'TWR') {
  if (!history || history.length === 0) return [];

  const basePoint = history[0];
  
  return history.map(point => {
    let fundReturn = 0;
    let indexReturn = (point.vnindex / basePoint.vnindex - 1) * 100;

    if (method === 'TWR') {
      // TWR is based on Unit Value growth
      const baseUnitValue = basePoint.unitValue || INITIAL_UNIT_PRICE;
      fundReturn = (point.unitValue / baseUnitValue - 1) * 100;
    } else {
      // ROI (MWR simplified) is based on (NAV - TotalInvested) / TotalInvested
      // This is a simpler version of ROI for the dashboard
      const totalInvested = point.totalInvested || point.initialNav;
      fundReturn = totalInvested > 0 ? ((point.nav - totalInvested) / totalInvested) * 100 : 0;
    }

    return {
      date: point.date,
      fund: fundReturn,
      index: indexReturn,
      nav: point.nav,
      unitValue: point.unitValue
    };
  });
}
