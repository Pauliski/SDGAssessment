// calculate estimates for number of infected people
const normalizeTimeToElapse = (timeToElapse, periodType) => {
  switch (periodType) {
    case 'months':
      return timeToElapse * 30;
    case 'weeks':
      return timeToElapse * 7;
    default:
      return timeToElapse;
  }
};
  /* const AvgIncome = (population, Income)=>{
    return population/Income;
  }
  const AverageIncome = AvgIncome(
    data.population,
    data.region.avgDailyIncomeInUSD
    ); */
const covid19ImpactEstimator = (data) => {
  const impact = {};
  const severeImpact = {};
  // currently number of infected people
  impact.currentlyInfected = data.reportedCases * 10;
  severeImpact.currentlyInfected = data.reportedCases * 50;
  // normalize number of days
  const numberOfDays = normalizeTimeToElapse(
    data.timeToElapse,
    data.periodType
  );
    // calculate the factor
  const factor = Math.trunc(numberOfDays / 3);
  // calculate the number of infections by requested .
  impact.infectionsByRequestedTime = impact.currentlyInfected * 2 ** factor;
  severeImpact.infectionsByRequestedTime = severeImpact.currentlyInfected * 2 ** factor;
  // calculate the number of severe cases by requested time.
  impact.severeCasesByRequestedTime = 0.15
  * impact.infectionsByRequestedTime;
  severeImpact.severeCasesByRequestedTime = 0.15
  * severeImpact.infectionsByRequestedTime;
  // we are expecting to have 35% of available hospital bed.
  const expectedNumberOfHospitalBeds = 0.35 * data.totalHospitalBeds;
  // calculate hospital beds by requested time.
  impact.hospitalBedsByRequestedTime = Math.trunc(expectedNumberOfHospitalBeds
      - impact.severeCasesByRequestedTime);
  severeImpact.hospitalBedsByRequestedTime = Math.trunc(expectedNumberOfHospitalBeds
      - severeImpact.severeCasesByRequestedTime);
  impact.casesForICUByRequestedTime = Math.trunc(0.05
    * impact.infectionsByRequestedTime);
  severeImpact.casesForICUByRequestedTime = Math.trunc(0.05
    * severeImpact.infectionsByRequestedTime);
  impact.casesForVentilatorsByRequestedTime = Math.trunc(0.02
    * impact.infectionsByRequestedTime);
  severeImpact.casesForVentilatorsByRequestedTime = Math.trunc(0.02
    * severeImpact.infectionsByRequestedTime);
  const incomePopulation = data.region.avgDailyIncomePopulation;
  const income = data.region.avgDailyIncomeInUSD;
  impact.dollarsInFlight = Math.trunc((impact.infectionsByRequestedTime
    * incomePopulation * income)
    / numberOfDays);
  severeImpact.dollarsInFlight = Math.trunc((severeImpact.infectionsByRequestedTime
    * income * incomePopulation) / numberOfDays);
  return {
    data,
    impact,
    severeImpact
  };
};
export default covid19ImpactEstimator;
