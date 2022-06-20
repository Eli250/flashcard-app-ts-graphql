import {
  extendType,
  nonNull,
  objectType,
  stringArg,
  intArg,
  inputObjectType,
  enumType,
  nullable,
  booleanArg,
  arg,
  list,
} from "nexus";
import { ApolloError } from "apollo-server";
import { Prisma } from "@prisma/client";

export const Flashcard = objectType({
  name: "Flashcard",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("question");
    t.nonNull.string("answer");
    t.nonNull.string("details");
    t.boolean("isDone");
    t.string("image");
    t.field("cardOwner", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.flashcard
          .findUnique({
            where: { id: parent.id },
          })
          .cardOwner();
      },
    });
  },
});

export const FlashcardQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("allFlashcards", {
      type: "Flashcard",
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(CardOrderByInput)) }),
      },
      resolve(parent, args, context, info) {
        const where = args.filter
          ? {
              OR: [
                { question: { contains: args.filter } },
                { answer: { contains: args.filter } },
                { details: { contains: args.filter } },
              ],
            }
          : {};
        return context.prisma.flashcard.findMany({
          where,
          orderBy: args?.orderBy as
            | Prisma.Enumerable<Prisma.FlashcardOrderByWithRelationInput>
            | undefined,
          skip: args?.skip as number | undefined,
          take: args?.take as number | undefined,
        });
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
        const { userId } = context;

        if (!userId) {
          throw new ApolloError(
            "Please signin to create a flashcard",
            "UNAUTHORIZED"
          );
        }
        const newFlashcard = context.prisma.flashcard.create({
          data: {
            question: question,
            answer: answer,
            details: details,
            image: args?.image as string,
            cardOwner: { connect: { id: userId } },
          },
        });
        return newFlashcard;
      },
    });
    t.nonNull.field("updateFlashcard", {
      type: "Flashcard",
      args: {
        id: nonNull(intArg()),
        question: nullable(stringArg()),
        answer: nullable(stringArg()),
        details: nullable(stringArg()),
        isDone: nullable(booleanArg()),
        image: nullable(stringArg()),
      },

      resolve(parent, args, context) {
        const { id, question, answer, details, isDone, image } = args;
        const { userId } = context;

        if (!userId) {
          throw new ApolloError(
            "Please signin to update a flashcard",
            "UNAUTHORIZED"
          );
        }

        const updatedFlashcard = context.prisma.flashcard.update({
          where: { id },
          data: {
            ...(question && { question }),
            ...(answer && { answer }),
            ...(details && { details }),
            ...(isDone != null && { isDone }),
            ...(image && { image }),
          },
        });

        return updatedFlashcard;
      },
    });
    t.nonNull.field("deleteFlashcard", {
      type: "Flashcard",
      args: {
        id: nonNull(intArg()),
      },
      resolve(parent, args, context) {
        const { id } = args;
        const { userId } = context;

        if (!userId) {
          throw new ApolloError(
            "Please signin to delete a flashcard",
            "UNAUTHORIZED"
          );
        }
        return context.prisma.flashcard.delete({
          where: { id },
        });
      },
    });
  },
});

export const CardOrderByInput = inputObjectType({
  name: "CardOrderByInput",
  definition(t) {
    t.field("id", { type: Sort });
    t.field("question", { type: Sort });
    t.field("answer", { type: Sort });
    t.field("details", { type: Sort });
    t.field("createdAt", { type: Sort });
  },
});

export const Sort = enumType({
  name: "Sort",
  members: ["asc", "desc"],
});
