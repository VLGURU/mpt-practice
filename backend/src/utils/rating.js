const calculateRating = (avgGrade, skills = []) => {
  const baseRating = parseFloat(avgGrade);
  const skillsBonus = skills.length * 0.1;
  return Math.min(5.0, Number((baseRating + skillsBonus).toFixed(1)));
};

module.exports = { calculateRating };