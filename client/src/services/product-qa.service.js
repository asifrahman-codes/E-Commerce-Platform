import api from "./api";
import API_ENDPOINTS from "./endpoints";

const payload = (response) =>
  response?.data?.data ?? response?.data ?? response;

export async function getProductQuestions(productId, params = {}) {
  return payload(await api.get(API_ENDPOINTS.PRODUCT_QA.PRODUCT(productId), { params }));
}

export async function askProductQuestion(productId, question) {
  return payload(await api.post(
    API_ENDPOINTS.PRODUCT_QA.PRODUCT(productId),
    { question }
  ));
}

export async function markAnswerUseful(answerId) {
  return payload(await api.post(API_ENDPOINTS.PRODUCT_QA.ANSWER_USEFUL(answerId)));
}

export async function unmarkAnswerUseful(answerId) {
  return payload(await api.delete(API_ENDPOINTS.PRODUCT_QA.ANSWER_USEFUL(answerId)));
}

export async function getAdminProductQuestions(params = {}) {
  return payload(await api.get(API_ENDPOINTS.PRODUCT_QA.ADMIN_QUESTIONS, { params }));
}

export async function moderateProductQuestion(questionId, data) {
  return payload(await api.patch(
    API_ENDPOINTS.PRODUCT_QA.MODERATE_QUESTION(questionId),
    data
  ));
}

export async function answerProductQuestion(questionId, answer) {
  return payload(await api.put(
    API_ENDPOINTS.PRODUCT_QA.ANSWER_QUESTION(questionId),
    { answer }
  ));
}

export async function moderateProductAnswer(answerId, data) {
  return payload(await api.patch(
    API_ENDPOINTS.PRODUCT_QA.MODERATE_ANSWER(answerId),
    data
  ));
}
