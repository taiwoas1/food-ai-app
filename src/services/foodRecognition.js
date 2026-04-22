const API_URL = 'http://localhost:5000/image-recognition';

const NON_FOOD = [
  'chair', 'table', 'phone', 'car', 'person', 'building',
  'computer', 'book', 'bottle', 'bag', 'shoe', 'clothing',
  'animal', 'dog', 'cat', 'plant', 'flower', 'tree',
  'furniture', 'vehicle', 'electronic', 'instrument',
];

export async function identifyFood(imageBase64) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_app_id: { user_id: 'clarifai', app_id: 'main' },
      inputs: [{ data: { image: { base64: imageBase64 } } }],
    }),
  });

  const data = await response.json();
  const concepts = data?.outputs?.[0]?.data?.concepts;

  if (!concepts) throw new Error("Couldn't read anything from that image.");

  return concepts.slice(0, 3).map(item => ({
    name: item.name,
    confidence: (item.value * 100).toFixed(1),
  }));
}

export function isEdible(foodName) {
  const name = foodName.toLowerCase();
  return !NON_FOOD.some(keyword => name.includes(keyword));
}