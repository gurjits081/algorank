import axios from 'axios';

const languageIds = {
  PYTHON: 71,
  JAVA: 62,
  JAVASCRIPT: 63,
};

export const getJudge0LanguageId = (language) => {
  return languageIds[language.toUpperCase()];
};

export const submitBatch = async (submissions) => {
  try {
    const { data } = await axios.post(
      `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
      {
        submissions,
      }
    );

    console.log('SUBMISSIONS DATA: ', data);

    return data;
  } catch (error) {
    console.log('Error encountered while submitting submissions to judge0: ', error);
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResults = async (tokens) => {
  try {
    while (true) {
      const { data } = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`, {
        params: {
          tokens: tokens.join(','),
          base64_encoded: false,
        },
      });

      const results = data.submissions;

      const isAllDone = results.every((r) => r.status.id !== 1 && r.status.id !== 2);

      if (isAllDone) return results;
      await sleep(1000);
    }
  } catch (error) {
    console.log('Error encountered while polling the batch results from Judge0', error);
    throw error;
  }
};
