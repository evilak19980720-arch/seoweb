import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// @ts-ignore
window.Pusher = Pusher

/**
 * 广播
 */
class Broadcast {
  echo() {
    return new Echo({
      broadcaster: 'reverb',
      key: 'mku0htjjufglgnmm1nfs',
      wsHost: 'pro.test',
      wsPort: 8080,
      wssPort: 8080,
      forceTLS: false,
      enabledTransports: ['ws', 'wss']
    })
  }

  channel(channel: string, event: string, callback: Function) {
    return this.echo()
      .channel(channel)
      .listen(event, (e: any) => {
        callback(e)
      })
  }

  private(channel: string, event: string, callback: Function) {
    return this.echo()
      .private(channel)
      .listen(event, (e: any) => {
        callback(e)
      })
  }
}

const broadcast = new Broadcast()

export default broadcast
