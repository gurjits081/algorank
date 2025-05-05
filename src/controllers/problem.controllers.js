import { db } from '../libs/db.js';
import { getJudge0LanguageId, pollBatchResults, submitBatch } from '../libs/judge0.lib.js';

export const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return res
          .status(400)
          .json({ message: `Language ${language} is not supported at the moment.` });
      }

      // Prepare submissions
      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      console.log("SUBMISSION PREPARED FOR JUDGE", submissions)

      // Submit submissions to judge0
      const submissionResults = await submitBatch(submissions);

      // extract the tokens
      const tokens = submissionResults.map((res) => res.token);

      // check submission status
      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        console.log('RESULT: ', result);
        if (result.status.id !== 3) {
          return res.status(400).json({ message: `Testcase ${i + 1} failed for the ${language}` });
        }
      }
    }

    // create new problem in the db
    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      problem: newProblem,
    });
  } catch (error) {
    console.log('Error while creating problem: ', error);
    return res.status(500).json({ error: 'Error creating problem' });
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const problems = await db.problem.findMany();

    if (!problems) {
      return res.status(400).json({ error: 'No problems found' });
    }

    res.status(200).json({
      success: true,
      message: 'Probelms fetched successfully',
      problems,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Error while fetching all problems' });
  }
};

export const getProblemById = async (req, res) => {
  const { id } = req.params;
  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(404).json({
        error: 'No Problem Found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Problem Fetched Successfully',
      problem,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: 'Error while fetching problem',
    });
  }
};

export const deleteProblem = async (req, res) => {
  const { id } = req.params;
  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(404).json({
        error: 'Problem Not Found',
      });
    }

    await db.problem.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Problem Deleted Successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: 'Error while deleting the problem',
    });
  }
};

export const getAllProblemsSolvedbyUser = async (req, res) => {
  try {
    const problems = await db.problem.findMany({
      where: {
        solvedBy: {
          userId: req.user.id,
        },
      },
      include: {
        solvedBy: {
          where: {
            userId: req.user.id,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Problems fetched successfully',
      problems,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: 'Error while fetching problems',
    });
  }
};
