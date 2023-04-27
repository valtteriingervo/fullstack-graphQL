import { useState } from 'react'
import { useMutation } from '@apollo/client'
import Select from 'react-select'

import { EDIT_AUTHOR, ALL_AUTHORS } from '../queries'

const EditAuthor = (props) => {

  const authorList = props.authors.map(author => {
    return { value: author.name, label: author.name }
  })

  const [author, setAuthor] = useState(authorList[0].value)
  const [born, setBorn] = useState('')

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    editAuthor({
      variables:
      {
        name: author,
        setBornTo: born
      }
    })

    console.log('edit author...')

    setAuthor('')
    setBorn('')
  }

  const changeAuthor = (authorInList) => setAuthor(authorInList.value)

  return (
    <div>
      <form onSubmit={submit}>
        <Select
          defaultValue={authorList[0]}
          onChange={changeAuthor}
          options={authorList}
        />
        <div>
          born
          <input
            value={born}
            // Need to change String to Int for GraphQL
            onChange={({ target }) => setBorn(parseInt(target.value))}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default EditAuthor