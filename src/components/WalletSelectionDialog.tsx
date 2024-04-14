import { Button, Dialog, Stack } from "@mui/material";
import { connectToMetamask } from "../services/wallets/metamask/metamaskClient";

interface WalletSelectionDialogProps {
    open: boolean;
    onClose: (value: string) => void;
}

export const WalletSelectionDialog = (props: WalletSelectionDialogProps) => {
    const { onClose, open } = props;
    
    return (
        <Dialog onClose={onClose} open={open}>
            <Stack p={2} gap={1}>
                <Button
                    variant="contained"
                    onClick={() => {
                        connectToMetamask();
                    }}
                >
                    Metamask
                </Button>
            </Stack>
        </Dialog>
    );
}
