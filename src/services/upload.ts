import { ADMIN_PREFIX } from '../lib/constants';

export const uploadImage = async (file: File, token: string) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${ADMIN_PREFIX}/images`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(JSON.stringify(json));
  }
  return json.url;
};
