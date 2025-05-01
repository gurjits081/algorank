import { getJudge0LanguageId, submitBatch } from '../libs/judge0.lib';

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
    for (const [language, solutionCode] of object.entries(referenceSolutions)) {
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

      // Submit submissions to judge0
      const submissionResults = await submitBatch(submissions);

      // extract the tokens
      const tokens = submissionResults.map((res) => res.token);

      // check submission status
      const results = await pollBatchResults(tokens);

      for(let i = 0; i < results.length; i++) {
        const result = results[i];
        console.log("RESULT: ", result)
        if(result.status_id !== 3) {
            return res.status(400).json({message: `Testcase ${i + 1} failed for the ${language}`})
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
        }
    })

    res.status(201).json({
        success: true,
        message: "Problem created successfully",
        problem: newProblem
    })
  } catch (error) {
    console.log("Error while creating problem: ", error)
    return res.status(500).json({error: "Error creating problem"})
  }
};
