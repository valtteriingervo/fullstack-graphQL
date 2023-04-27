import { useState } from 'react'
import { useApolloClient, useQuery, useSubscription } from '@apollo/client'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import EditAuthor from './components/EditAuthor'
import LoginForm from './components/LoginForm'
import Recommend from './components/Recommend'

import { ALL_AUTHORS, BOOK_ADDED } from './queries'
import { ALL_BOOKS } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const result = useQuery(ALL_AUTHORS)
  const bookResult = useQuery(ALL_BOOKS)
  const client = useApolloClient()

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const newBook = data.data.bookAdded
      window.alert(`New book added: ${newBook.title} by ${newBook.author.name}`)
    }
  })

  if (result.loading || bookResult.loading) {
    return <div>loading ...</div>
  }

  const logout = () => {
    if (window.confirm("Do you really want to log out?")) {
      setToken(null)
      localStorage.clear()
      client.resetStore()
      setPage('authors')
    }
  }

  // If the user is not logged in, show the functionality available 
  // to users that are not logged in
  if (!token) {
    return (
      <div>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('loginForm')}>login</button>
        </div>

        <Authors show={page === 'authors'} authors={result.data.allAuthors} />

        <Books show={page === 'books'} books={bookResult.data.allBooks} />

        <LoginForm show={page === 'loginForm'} setToken={setToken} setPage={setPage} />
      </div>
    )
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('editAuthor')}>edit author</button>
        <button onClick={() => setPage('recommend')}>recommend</button>
        <button onClick={() => logout()}>log out</button>
      </div>

      <Authors show={page === 'authors'} authors={result.data.allAuthors} />

      <Books show={page === 'books'} books={bookResult.data.allBooks} />

      <NewBook show={page === 'add'} />

      <EditAuthor show={page === 'editAuthor'} authors={result.data.allAuthors} />

      <Recommend show={page === 'recommend'} books={bookResult.data.allBooks} />
    </div>
  )
}

export default App
