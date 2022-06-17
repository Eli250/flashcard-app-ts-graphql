import { extendType, objectType, nonNull, stringArg } from "nexus";

export const Flashcard = objectType({
  name: "Flashcard",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("question");
    t.nonNull.string("answer");
    t.nonNull.string("details");
    t.boolean("isDone");
    t.string("image");
  },
});

export const FlashcardQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("allFlashcards", {
      type: "Flashcard",
      resolve(parent, args, context, info) {
        return context.prisma.flashcard.findMany();
      },
    });
  },
});

export const AddFlashcard = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      type: "Flashcard",
      args: {
        question: nonNull(stringArg()),
        answer: nonNull(stringArg()),
        details: nonNull(stringArg()),
        image: stringArg(),
      },
      resolve(parent, args, context) {
        const { question, answer, details } = args;
        const newFlashcard = context.prisma.flashcard.create({
          data: {
            question: question,
            answer: answer,
            details: details,
            image: args?.image as string,
          },
        });
        return newFlashcard;
      },
    });
  },
});
