import { ME } from '../queries'
import { useQuery } from '@apollo/client'
// Load the full build.

const Recommend = (props) => {
  const user = useQuery(ME)

  if (!props.show) {
    return null
  }

  if (user.loading) {
    return <div>loading ...</div>
  }

  const books = props.books
  const usergenre = user.data.me.favoriteGenre

  return (
    <div>
      <h2>recommendations</h2>

      <h3>books in your favorite genre '{usergenre}'</h3>

      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books
            .filter(b => usergenre ? b.genres.includes(usergenre) : b)
            .map((a) => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
        </tbody>
      </table>

    </div>
  )
}

export default Recommend
