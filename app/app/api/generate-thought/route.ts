import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export async function POST(req: NextRequest) {
    const { title, text } = await req.json();

    if (!title || !text) {
        return NextResponse.json({ error: "title and text are required" }, { status: 400 });
    }

    const schema = z.object({ thought: z.string() });

    const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        prompt: `
        You are a helpful writer assistant that generates a thought about a given text. the writer is having a hard time writing a thought about a given text.
        You are to generate a thought about the given text. it should be a single question that the writer can use to start writing. it should be a question that is not too broad or too narrow. make it short and concise.
        The title is: ${title}
        The text is: ${text}
        The thought is:`,
        temperature: 0.5,
        output: "no-schema",
    });

    const { thought } = schema.parse(object);
    return NextResponse.json({ thought });
}