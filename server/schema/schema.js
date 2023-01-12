const graphql = require('graphql');
const axios =  require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList
} = graphql;

// dummay data
const jsonplaceholderurl = 'https://jsonplaceholder.typicode.com';

var books = [
    {id: '1', name: 'Name of the wind', genre: 'Fantasy', authorId: '2'},
    {id: '2', name: 'The final Empire', genre: 'Fantasy', authorId: '2'},
    {id: '3', name: 'The Long Earth', genre: 'Sci-Fi', authorId: '1'}
];

const authors = [
	{ id: '1', name: 'J. K. Rowling', age: 45 },
	{ id: '2', name: 'J. R. R. Tolkien', age: 25 },
	{ id: '3', name: 'Brent Weeks', age: 30 }
];

const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        genre: { type: GraphQLString },
        author: {
            type: AuthorType,
            resolve(parent, args){
                return authors.find((u) => u.id == parent.authorId);
            }
        }
    })
});

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args){
                return books.filter((u) => u.authorId == parent.id);
            }
        }
    })
});

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: { type: GraphQLInt },
        userId: { type: GraphQLInt },
        title: { type: GraphQLString },
        body: { type: GraphQLString },
        comments: {
            type: new GraphQLList(CommentType),
            resolve(parent, args){
                return axios.get(`${jsonplaceholderurl}/comments`).then(res => res.data.filter((u) => u.postId == parent.id));
            }
        }
    })
});

const CommentType = new GraphQLObjectType({
    name: 'Comment',
    fields: () => ({ 
        id: { type: GraphQLInt },
        postId: { type: GraphQLInt },
        name: { type: GraphQLString },
        body: { type: GraphQLString },
        post: {
            type: new GraphQLList(PostType),
            resolve(parent, args){
                return axios.get(`${jsonplaceholderurl}/posts`).then(res => res.data.filter((u) => u.id == parent.postId));
            }
        }
    })
});



const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args) {
                return books
            }
        },
        book: {
            type: BookType,
            args: { id: { type: GraphQLID }},
            resolve(parent, args){
                return books.find((u) => u.id == args.id);
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent, args) {
                return authors
            }
        },
        author: {
            type: AuthorType,
            args: { id: { type: GraphQLID }},
            resolve(parent, args){
                return authors.find((u) => u.id == args.id);
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve(parent, args){
                return axios.get(`${jsonplaceholderurl}/posts`).then(res => res.data);
            }
        },
        post: {
            type: PostType,
            args: { id: { type: GraphQLID }},
            resolve(parent, args){
                return axios.get(`${jsonplaceholderurl}/posts`).then(res => res.data.find((u) => u.id == args.id));
            }
        },
        comments: {
            type: new GraphQLList(CommentType),
            resolve(parent, args){
                return axios.get(`${jsonplaceholderurl}/comments`).then(res => res.data);
            }
        },
        comment: {
            type: CommentType,
            args: { id: { type: GraphQLID }},
            resolve(parent, args){
                return axios.get(`${jsonplaceholderurl}/comments`).then(res => res.data.find((u) => u.id == args.id));
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery
})