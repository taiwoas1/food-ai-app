const calorieData = {
  apple: { calories: 95, protein: '0.5g', carbs: '25g', fat: '0.3g' },
  banana: { calories: 105, protein: '1.3g', carbs: '27g', fat: '0.4g' },
  pizza: { calories: 285, protein: '12g', carbs: '36g', fat: '10g' },
  burger: { calories: 354, protein: '20g', carbs: '29g', fat: '17g' },
  salad: { calories: 20, protein: '1.8g', carbs: '3.5g', fat: '0.2g' },
  orange: { calories: 62, protein: '1.2g', carbs: '15g', fat: '0.2g' },
  sandwich: { calories: 250, protein: '11g', carbs: '33g', fat: '9g' },
  pasta: { calories: 220, protein: '8g', carbs: '43g', fat: '1.3g' },
  rice: { calories: 206, protein: '4.3g', carbs: '45g', fat: '0.4g' },
  chicken: { calories: 239, protein: '27g', carbs: '0g', fat: '14g' },
  sushi: { calories: 350, protein: '20g', carbs: '38g', fat: '11g' },
  soup: { calories: 80, protein: '4g', carbs: '10g', fat: '2g' },
  steak: { calories: 271, protein: '26g', carbs: '0g', fat: '18g' },
  cake: { calories: 367, protein: '5g', carbs: '52g', fat: '16g' },
};

export function getCalories(foodName) {
  const key = foodName.toLowerCase();

  if (calorieData[key]) {
    return calorieData[key];
  }

  for (const food in calorieData) {
    if (key.includes(food)) {
      return calorieData[food];
    }
  }

  return { calories: 'Unknown', protein: '?', carbs: '?', fat: '?' };
}