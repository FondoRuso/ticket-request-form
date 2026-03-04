import { boot } from 'quasar/wrappers'
import { QInput, QSelect } from 'quasar'

export default boot(() => {
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
