const openai = require("../services/openaiService");
const PptxGenjs = require("pptxgenjs");

async function generatePpt(req, res) {
    try {
        console.log("Request body:", req.body);
        const { topic, yearLevel, objectives, course } = req.body;

        if (!topic || !yearLevel || !objectives || !course) {
            console.error("Missing required fields");
            return res.status(400).json({
                success: false,
                message: "Missing required fields: topic, yearLevel, objectives, course",
            });
        }

        const objectivesText = Array.isArray(objectives)
            ? objectives.join("; ")
            : objectives;

        const prompt = `
            You are an AI that generates a thorough, detailed PowerPoint presentation in JSON format.
            The presentation must be suitable for a ${yearLevel} class following the ${course} curriculum.

            Topic: ${topic}
            Learning Objectives: ${objectivesText}

            Return a slides array in valid JSON, like this:
            [
                {
                    "slideTitle": "Title of Slide",
                    "slidePoints": ["Point 1", "Point 2", ...]
                },
                ...
            ]

            Each slide must be detailed, relevant, and clearly organized. Keep bullet points concise but thorough enough for a teacher to use in class.
        `;

        console.log("Generated Prompt:", prompt);

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "system", content: prompt }],
            temperature: 0.7,
        });

        console.log("OpenAI Response: ", response);
        const rawText = response.choices[0]?.message?.content;
        console.log("Raw Text from OpenAI:", rawText);

        let slidesData;
        try {
            slidesData = JSON.parse(rawText);
        } catch (error) {
            console.error("Failed to parse AI response as JSON: ", error);
            return res.status(500).json({
                success: false,
                message: "The AI response was not valid JSON. Please try again.",
            });
        }

        const pptx = new PptxGenjs();

        slidesData.forEach((slideObj, index) => {
            let slide = pptx.addSlide();
            const maxY = 6; // Max vertical space for content
            const lineHeight = 0.3; // Height for a single line of text
            const maxCharsPerLine = 60; // Estimate characters per line for wrapping
            let currentY = 1.25; // Initial Y position for bullets

            // Add Title (Header)
            const baseTitle = slideObj.slideTitle || `Slide ${index + 1}`;
            const titleLines = Math.ceil(baseTitle.length / maxCharsPerLine); // Estimate number of lines
            const titleHeight = titleLines * lineHeight;

            if (index === 0) {
                // Title Slide
                slide.addText(topic, {
                    x: 1,
                    y: 1.5,
                    w: 8,
                    h: titleHeight,
                    fontSize: 36,
                    bold: true,
                    align: "center",
                });

                slide.addText(`Course: ${course}`, {
                    x: 1,
                    y: 3,
                    w: 8,
                    h: 0.8,
                    fontSize: 24,
                    align: "center",
                });
            } else {
                slide.addText(baseTitle, {
                    x: 0.5,
                    y: 0.4,
                    w: 8,
                    h: titleHeight,
                    fontSize: 28,
                    bold: true,
                });

                // Adjust starting position for bullets based on title height
                currentY = 0.5 + titleHeight + 0.2; // Add padding after title

                // Add Bullet Points
                if (Array.isArray(slideObj.slidePoints)) {
                    slideObj.slidePoints.forEach((point) => {
                        const numLines = Math.ceil(point.length / maxCharsPerLine); // Estimate number of lines
                        const textHeight = numLines * lineHeight;

                        if (currentY + textHeight > maxY) {
                            // If exceeding maxY, create a new slide
                            slide = pptx.addSlide();
                            slide.addText(`${baseTitle} (Continued)`, {
                                x: 0.5,
                                y: 0.4,
                                w: 8,
                                h: titleHeight,
                                fontSize: 28,
                                bold: true,
                            });
                            currentY = 0.5 + titleHeight + 0.2; // Reset position for new slide
                        }

                        slide.addText(point, {
                            x: 0.5,
                            y: currentY,
                            w: 8,
                            fontSize: 18,
                            bullet: true,
                            color: "000000",
                            fontFace: "Arial",
                        });

                        currentY += textHeight + 0.25; // Adjust position for next line with padding
                    });
                }
            }

            // Add Footer
            slide.addText("Generated by SmartSeats", {
                x: 0,
                y: 7,
                w: 10,
                h: 0.5,
                fontSize: 10,
                color: "666666",
                align: "center",
            });
        });

        const pptxBuffer = await pptx.write("nodebuffer");

        // Set headers for file download
        res.setHeader("Content-Disposition", `attachment; filename="${topic}.pptx"`);
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        );

        return res.send(pptxBuffer);
    } catch (error) {
        console.error("Error generating PowerPoint: ", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while generating the PowerPoint.",
        });
    }
}

module.exports = { generatePpt };
