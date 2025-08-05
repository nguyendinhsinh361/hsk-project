import { z } from 'zod';

export const GRAMMATICAL_RANGE_SCHEMA = z.object({
    satisfy: z.string(),
    explain: z.string(),
    analysis: z.string(),
});

export const GRAMMATICAL_ACCURACY_SCHEMA = z.object({
    errors: z.string(),
    analysis: z.array(z.string()),
});

export const LEXICAL_RESOURCE_SCHEMA = z.object({
    errors: z.string(),
    analysis: z.array(z.string()),
});

export const COHERENCE_AND_COHESION_SCHEMA = z.object({
    satisfy: z.string(),
    analysis: z.string(), 
});

export const PERSONAL_OPINION_SCHEMA = z.object({
    satisfy: z.string(),
    explain: z.string(), 
});

const suggestedVocabularySchema = z.object({
    term: z.string(),
    reason: z.string(),
});
  
export const ADVANCED_VOCABULARY_SCHEMA = z.object({
    suggestedVocabulary: z.array(suggestedVocabularySchema),
});

export const ADVANCED_SENTENCE_SCHEMA = z.object({
    suggestedSentence: z.array(z.string()),
});

export const RELATED_IMAGE_SCHEMA = z.object({
    satisfy: z.string(),
    explain: z.string(), 
});

// Định nghĩa schema Zod cho từng phần tử trong mảng "vocabularies" và "sentences"
const vocabulary530002Schema = z.object({
    vocabularyUse: z.string(),
    reasonUse: z.string(),
});
  
  const sentence530002Schema = z.object({
    sentencesUse: z.string(),
    reasonUse: z.string(),
});

export const ADVANCED_REWRITTEN_PARAGRAPH_HSK5_530002_SCHEMA = z.object({
    comment: z.string(), // "comment" là một chuỗi
    bestUpgradeAnswer: z.string(), // "bestUpgradeAnswer" là một chuỗi
    vocabularies: z.array(vocabulary530002Schema), // "vocabularies" là một mảng chứa các đối tượng tuân theo schema "vocabularySchema"
    sentences: z.array(sentence530002Schema), // "sentences" là một mảng chứa các đối tượng tuân theo schema "sentenceSchema"
});

const vocabulary530003Schema = z.object({
    vocabularyUse: z.string(),
    reasonUse: z.string(),
});
  
const sentence530003Schema = z.object({
    sentencesUse: z.string(),
    reasonUse: z.string(),
});

export const ADVANCED_REWRITTEN_PARAGRAPH_HSK5_530003_SCHEMA = z.object({
    comment: z.string(), // "comment" là một chuỗi
    bestUpgradeAnswer: z.string(), // "bestUpgradeAnswer" là một chuỗi
    vocabularies: z.array(vocabulary530003Schema), // "vocabularies" là một mảng chứa các đối tượng tuân theo schema "vocabularySchema"
    sentences: z.array(sentence530003Schema), // "sentences" là một mảng chứa các đối tượng tuân theo schema "sentenceSchema"
});

const vocabulary630001Schema = z.object({
    vocabularyUse: z.string(),
    reasonUse: z.string(),
  });
  
const sentence630001Schema = z.object({
    sentencesUse: z.string(),
    reasonUse: z.string(),
});

export const ADVANCED_REWRITTEN_PARAGRAPH_HSK6_630001_SCHEMA = z.object({
    vocabularies: z.array(vocabulary630001Schema), // "vocabularies" là một mảng chứa các đối tượng tuân theo schema "vocabularySchema"
    sentences: z.array(sentence630001Schema), // "sentences" là một mảng chứa các đối tượng tuân theo schema "sentenceSchema"
});

export const OVERALL_EVALUATION_SCHEMA = z.object({
    overallEvaluation: z.string(),
});

const analysisHSK56Schema = z.array(z.string());

export const LEXICAL_RESOURCE_HSK56_SCHEMA = z.object({
    errors: z.string(), 
    analysis: analysisHSK56Schema,
});

export const GRAMMATICAL_ACCURACY_HSK56_SCHEMA = z.object({
    errors: z.string(), 
    analysis: analysisHSK56Schema,
});




