export interface BetaRequestPayload {
  tg_username: string;
  plan_name: string;
}

export interface BetaRequestResponseData {
  id: number;
  tg_username: string;
  plan_name: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function createBetaLead(
  payload: BetaRequestPayload
): Promise<BetaRequestResponseData> {
  const response = await fetch(`${API_BASE_URL}/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Ошибка при отправке заявки');
  }

  return response.json();
}
