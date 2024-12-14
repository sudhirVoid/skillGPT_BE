
export const flashCardsGeneratorTool_OPENAI = [{
    "name": "generate_flashCards",
    "description": "Generates questions and answers about a specified context given.",
    "parameters": {
        "type": "object",
        "properties": {
            "count": {
                "type": "integer",
                "description": "Number of questions to generate."
            },
            "topic": {
                "type": "string",
                "description": "The context from which you will make questions and answers."
            },
        },
        "required": ["count", "topic"]
    }
}]
