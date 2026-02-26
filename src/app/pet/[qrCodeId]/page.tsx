import { Metadata } from 'next';
import PetPublicProfile from './PetPublicProfile';

type Props = {
    params: Promise<{ qrCodeId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { qrCodeId } = await params;
    return {
        title: 'Pet Medical History | PetBuddy',
        description: 'View pet medical history and health records via QR code',
        openGraph: {
            title: 'Pet Medical History | PetBuddy',
            description: 'Scan to view this pet\'s full medical history and health profile',
        },
    };
}

export default async function PetPublicPage({ params }: Props) {
    const { qrCodeId } = await params;
    return <PetPublicProfile qrCodeId={qrCodeId} />;
}
