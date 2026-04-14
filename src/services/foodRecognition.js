export async function identifyFood(imageBase64) {
  const response = await fetch('http://localhost:5000/image-recognition', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_app_id: {
        user_id: 'clarifai',
        app_id: 'main',
      },
      inputs: [
        {
          data: {
            image: {
              base64: imageBase64,
            },
          },
        },
      ],
    }),
  });

  const data = await response.json();

  if (!data.outputs || !data.outputs[0].data.concepts) {
    throw new Error('No results returned');
  }

  const concepts = data.outputs[0].data.concepts;

  return concepts.slice(0, 3).map((item) => ({
    name: item.name,
    confidence: (item.value * 100).toFixed(1),
  }));
}

export function isEdible(foodName) {
  const nonEdibleKeywords = [
    'chair', 'table', 'phone', 'car', 'person', 'building',
    'computer', 'book', 'bottle', 'bag', 'shoe', 'clothing',
    'animal', 'dog', 'cat', 'plant', 'flower', 'tree',
    'furniture', 'vehicle', 'electronic', 'instrument'
  ];

  const name = foodName.toLowerCase();
  for (const keyword of nonEdibleKeywords) {
    if (name.includes(keyword)) {
      return false;
    }
  }
  return true;
}