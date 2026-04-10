const PAT = process.env.REACT_APP_CLARIFAI_KEY;
const MODEL_ID = 'food-item-recognition';
const MODEL_VERSION_ID = 'aa7f35c01e0642fda5cf400f543e7c40';

export async function identifyFood(imageBase64) {
  const response = await fetch(
    `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
    {
      method: 'POST',
      headers: {
        Authorization: `Key ${PAT}`,
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
              image: { base64: imageBase64 },
            },
          },
        ],
      }),
    }
  );

  const data = await response.json();
  const concepts = data.outputs[0].data.concepts;

  return concepts.slice(0, 3).map((item) => ({
    name: item.name,
    confidence: (item.value * 100).toFixed(1),
  }));
}