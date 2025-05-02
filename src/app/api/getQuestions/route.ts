import { NextResponse } from "next/server";
const prompt = `You are a teacher. Generate 5 questions based on the topic provided.  The questions should be relevant to the topic and should not be too easy or too hard. The answer to the question should be one word answer. You have answer me in JSON format. The JSON format should be like this:
{
    id : "GENERATE A UNIQUE ID",
    question : "GENERATE A QUESTION",
    answer : "GENERATE AN ANSWER",
}
    your topic is : 
`;


export async function POST(request : Request) {
    try{
        const { topic } = await request.json();
        console.log("Topic received from client:", topic);
        const response = await fetch(`
                https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API}
            `, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents : [
                        {
                            parts : [
                                {
                                    text : prompt + topic
                                }
                            ]
                        }
                    ]
                  
                }),
            })
    
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const jsonString = rawText.replace(/```json\n?|\n?```/g, "");
        const parsedData = JSON.parse(jsonString);
        console.log("Data from AI:", data);
    
            return NextResponse.json({
                data : parsedData,
                success : true,
                message : "Questions generated successfully",
            })
    }catch(e){
        console.error("Error in getQuestions API:", e)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}