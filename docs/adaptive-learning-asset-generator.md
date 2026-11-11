# Adaptive Learning Asset Generator

## Feature Overview
The Adaptive Learning Asset Generator extends the Learner Variability Engine by producing personalized instructional outputs from learner and task inputs.

## Inputs
- Learner Profile
- Competency
- Learning Objective
- Assessment Type

## Processing Pipeline
1. Analyze learner variability factors
2. Match personalization rules
3. Generate adaptive assets

## Outputs
- Choice Board
- Alternative Assessments
- Scaffolding Supports
- Engagement Strategies
- UDL Recommendations

---

## Suggested Data Contract (Input)

```json
{
  "learnerProfile": {
    "readingLevel": "string",
    "languageProficiency": "string",
    "iep504": ["string"],
    "interests": ["string"],
    "engagementPattern": "string",
    "executiveFunctionNeeds": ["string"],
    "accessNeeds": ["string"]
  },
  "competency": "string",
  "learningObjective": "string",
  "assessmentType": "string"
}
```

## Suggested Data Contract (Output)

```json
{
  "choiceBoard": [
    {
      "id": "cb1",
      "title": "Podcast Reflection",
      "modality": "audio",
      "difficulty": "on-level",
      "timeEstimateMin": 20,
      "whySelected": ["interest: storytelling", "reading_support"]
    }
  ],
  "alternativeAssessments": [
    {
      "id": "aa1",
      "format": "oral defense",
      "rubricAlignment": ["objective_1", "objective_2"],
      "accommodations": ["extended_time", "sentence_starters"],
      "whySelected": ["language_support", "expression_flexibility"]
    }
  ],
  "scaffoldingSupports": [
    {
      "id": "sc1",
      "type": "graphic_organizer",
      "timing": "pre-task",
      "fadingPlan": "remove prompts after 2 successful attempts",
      "whySelected": ["executive_function_support"]
    }
  ],
  "engagementStrategies": [
    {
      "id": "en1",
      "strategy": "choice + relevance hook",
      "implementation": "allow topic choice from learner interests",
      "whySelected": ["engagement_variability"]
    }
  ],
  "udlRecommendations": {
    "engagement": ["goal-setting checklist", "self-monitoring prompts"],
    "representation": ["visual + text directions", "key vocabulary preview"],
    "actionExpression": ["video, oral, or written submission options"]
  },
  "trace": {
    "matchedRules": ["R12", "R38", "R44"],
    "variabilityTags": ["language_support", "reading_support", "executive_function_support"]
  }
}
```

## Rule Examples

```yaml
- id: R12
  when:
    tags: [language_support]
    assessmentType: [constructed_response, project]
  then:
    alternativeAssessments: [oral_response, multimodal_product]
    scaffolds: [sentence_frames, vocabulary_bank]

- id: R38
  when:
    tags: [executive_function_support]
  then:
    scaffolds: [chunked_instructions, checklist, timebox_prompts]

- id: R44
  when:
    tags: [engagement_variability]
  then:
    engagementStrategies: [interest_based_choice, peer_collab_option]
```

## MVP Acceptance Criteria
- Returns all five output sections for valid inputs.
- Every generated item includes `whySelected` for explainability.
- Choice board contains at least two modality options.
- At least one alternative assessment maps to the learning objective.
- UDL recommendations cover engagement, representation, and action/expression.
- Rule matching trace is included (`matchedRules`, `variabilityTags`).
