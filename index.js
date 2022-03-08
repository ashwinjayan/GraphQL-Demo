import express from "express"
import { graphqlHTTP } from 'express-graphql';
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLInt } from 'graphql';

const authors = [
    { id: 1, name: "J. K. Rowling" },
    { id: 2, name: "J. R. R. Tolkien" },
    { id: 3, name: "Brent Weeks" }
]

const books = [
    { id: 1, name: "Harry Potter & The Sorcerer's Stone", authorId: 1 },
    { id: 2, name: "Harry Potter & The Chamber of Secrets", authorId: 1 },
    { id: 3, name: "The Two Towers", authorId: 2 },
    { id: 4, name: "Beyond the shadows", authorId: 3 },
]

const AuthorType = new GraphQLObjectType({
    name: 'Authors',
    description: "List of authors",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const BookType = new GraphQLObjectType({
    name: 'Books',
    description: "List of books",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    description: "Root Query for book details",
    fields: () => ({
        books: {
            type: new GraphQLList(BookType),
            description: "List of all books",
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: "List of all authors",
            resolve: () => authors
        },
        book: {
            type: BookType,
            description: "A single book",
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                return books.find(book => book.id === args.id)
            }
        },
        author: {
            type: AuthorType,
            description: "A single author",
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                return authors.find(author => author.id === args.id)
            }
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: "Add a book",
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const book = { id: books.length + 1, name: args.name, authorId: args.authorId }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: "Add a author",
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const author = { id: authors.length + 1, name: args.name }
                authors.push(author)
                return author
            }
        }
    })
})

const app = express()
const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutationType
    // query: new GraphQLObjectType({
    //     name: 'Helloworld',
    //     fields: () => ({
    //         message: {
    //             type: GraphQLString,
    //             resolve: () => "Hello World"
    //         }
    //     })
    // })
})

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))
app.listen(8000, () => console.log("server is running"))