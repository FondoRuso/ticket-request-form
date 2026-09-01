import { QInput, QSelect } from 'quasar'

import { defineBoot } from '#q-app'

export default defineBoot(() => {
  if (QInput.props.outlined) {
    QInput.props.outlined = {
      type: QInput.props.outlined,
      default: true,
    }
  }

  if (QSelect.props.outlined) {
    QSelect.props.outlined = {
      type: QSelect.props.outlined,
      default: true,
    }
  }
})
