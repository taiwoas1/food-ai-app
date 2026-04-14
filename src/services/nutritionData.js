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
  strawberry: { calories: 32, protein: '0.7g', carbs: '7.7g', fat: '0.3g' },
  watermelon: { calories: 30, protein: '0.6g', carbs: '7.6g', fat: '0.2g' },
  grapes: { calories: 69, protein: '0.7g', carbs: '18g', fat: '0.2g' },
  bread: { calories: 265, protein: '9g', carbs: '49g', fat: '3.2g' },
  egg: { calories: 155, protein: '13g', carbs: '1.1g', fat: '11g' },
  milk: { calories: 42, protein: '3.4g', carbs: '5g', fat: '1g' },
  cheese: { calories: 402, protein: '25g', carbs: '1.3g', fat: '33g' },
  yogurt: { calories: 59, protein: '10g', carbs: '3.6g', fat: '0.4g' },
  corn: { calories: 86, protein: '3.2g', carbs: '19g', fat: '1.2g' },
  broccoli: { calories: 34, protein: '2.8g', carbs: '7g', fat: '0.4g' },
  carrot: { calories: 41, protein: '0.9g', carbs: '10g', fat: '0.2g' },
  potato: { calories: 77, protein: '2g', carbs: '17g', fat: '0.1g' },
  tomato: { calories: 18, protein: '0.9g', carbs: '3.9g', fat: '0.2g' },
  cucumber: { calories: 16, protein: '0.7g', carbs: '3.6g', fat: '0.1g' },
  mango: { calories: 99, protein: '1.4g', carbs: '25g', fat: '0.6g' },
  pineapple: { calories: 50, protein: '0.5g', carbs: '13g', fat: '0.1g' },
  chocolate: { calories: 546, protein: '5g', carbs: '60g', fat: '31g' },
  icecream: { calories: 207, protein: '3.5g', carbs: '24g', fat: '11g' },
  coffee: { calories: 2, protein: '0.3g', carbs: '0g', fat: '0g' },
  juice: { calories: 45, protein: '0.7g', carbs: '10g', fat: '0.2g' },
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