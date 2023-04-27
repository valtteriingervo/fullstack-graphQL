import { useState } from 'react'
// Load the full build.
const _ = require('lodash');

const Books = (props) => {
  const [genre, setGenre] = useState(null)

  if (!props.show) {
    return null
  }

  const books = props.books
  console.log(books)

  const allGenres = _.uniq(books.flatMap(b => b.genres))
  console.log('allGenres', allGenres)

  return (
    <div>
      <h2>books</h2>

      <h3>In genre {genre ? genre : 'all genres'}</h3>

      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books
            .filter(b => genre ? b.genres.includes(genre) : b)
            .map((a) => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
        </tbody>
      </table>

      <div>
        {allGenres
          .map(g => (
            <button key={g} onClick={() => setGenre(g)}>{g}</button>
          ))}
        <button onClick={() => setGenre(null)}><b>all genres</b></button>
      </div>

    </div>
  )
}

export default Books
