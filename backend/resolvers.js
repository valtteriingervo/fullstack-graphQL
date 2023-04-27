const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const allBooks = await Book.find({}).populate('author')
      // Hope this filtering is still alright for 8.14 not using the link as help
      // (It seems to still work fine)
      return allBooks
        .filter(book => args.author ? (book.author.name === args.author) : book)
        .filter(book => args.genre ? book.genres.includes(args.genre) : book)
    },
    allAuthors: async () => {
      return Author.find({})
    },
    me: (root, args, context) => context.currentUser
  },
  Author: {
    bookCount: async (root) => await Book.find({ author: root.id }).countDocuments()
  },
  Mutation: {
    // Todo: Add publish the new book to subscribers
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }

      try {
        // If author doesn't yet exist, add it
        let author = await Author.findOne({ name: args.author })
        if (!author) {
          console.log('Creatin a new author')
          author = new Author({ name: args.author })
          console.log('New author', author)
          await author.save()
        }
        // Create the book
        const book = new Book({
          title: args.title,
          published: args.published,
          author: author._id, // Reference to the author id
          genres: args.genres
        })

        await book.save()

        pubsub.publish('BOOK_ADDED', { bookAdded: book.populate('author') })

        return book.populate('author')

      } catch (error) {
        console.log(error)
        throw new GraphQLError('Saving book failed - Please check the book title (min. 5 char) and author length (min. 4 char)', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }

      const author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError('Editing author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }

      return author
    },

    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })

      return user.save()
        .catch(error => {
          throw new GraphQLError('Creating the user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error
            }
          })
        })
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    }
  },
}

module.exports = resolvers

