import { ReactNode } from "react"
import { MetamaskContextProvider } from "../../contexts/MetamaskContext"
import { MetaMaskClient } from "./metamask/metamaskClient"

export const AllWalletsProvider = (props: {
  children: ReactNode | undefined
}) => {
  return (
      <MetamaskContextProvider>
        <MetaMaskClient />
        {props.children}
      </MetamaskContextProvider>
  )
}
