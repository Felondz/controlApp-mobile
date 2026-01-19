/**
 * Owner Color Helpers
 * Provides consistent color coding for account owners in collaborative projects
 */

export interface OwnerColorScheme {
    bg: string;
    text: string;
    border: string;
    chartColor: string;
}

export interface Account {
    id: number;
    propietario_id?: number;
    propietario_type?: string;
    propietario?: {
        name?: string;
        nombre?: string;
    };
    saldo_actual?: number;
}

export interface Transaction {
    cuenta_id: number;
    monto?: number;
}

export interface OwnerGroup {
    ownerId: number | string;
    ownerName: string;
    ownerType?: string;
    accounts: Account[];
    totalBalance: number;
}

export interface OwnerContribution {
    ownerId: number | string;
    ownerName: string;
    income: number;
    expense: number;
    net: number;
}

// Color palette for owner differentiation (supports up to 8 owners)
const OWNER_COLORS: OwnerColorScheme[] = [
    {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-500',
        chartColor: '#3b82f6', // blue-500
    },
    {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-500',
        chartColor: '#a855f7', // purple-500
    },
    {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-500',
        chartColor: '#22c55e', // green-500
    },
    {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-500',
        chartColor: '#f97316', // orange-500
    },
    {
        bg: 'bg-pink-50',
        text: 'text-pink-700',
        border: 'border-pink-500',
        chartColor: '#ec4899', // pink-500
    },
    {
        bg: 'bg-cyan-50',
        text: 'text-cyan-700',
        border: 'border-cyan-500',
        chartColor: '#06b6d4', // cyan-500
    },
    {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-500',
        chartColor: '#f59e0b', // amber-500
    },
    {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-500',
        chartColor: '#6366f1', // indigo-500
    },
];

/**
 * Get color scheme for an owner
 */
export const getOwnerColor = (ownerId?: number | string): OwnerColorScheme => {
    if (!ownerId) return OWNER_COLORS[0];
    const index = parseInt(String(ownerId)) % OWNER_COLORS.length;
    return OWNER_COLORS[index];
};

/**
 * Get owner name from account
 */
export const getOwnerName = (account: Account): string => {
    if (!account?.propietario) return 'Proyecto';
    return account.propietario.name || account.propietario.nombre || 'Desconocido';
};

/**
 * Get owner initials for badge display
 */
export const getOwnerInitials = (name: string): string => {
    if (!name || name === 'Proyecto') return '📁';
    const parts = name.split(' ').filter((p) => p.length > 0);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Check if account belongs to current user
 */
export const isMyAccount = (account: Account, currentUserId: number): boolean => {
    if (!account?.propietario_id || !currentUserId) return false;
    return (
        account.propietario_type === 'App\\Models\\User' &&
        parseInt(String(account.propietario_id)) === parseInt(String(currentUserId))
    );
};

/**
 * Group accounts by owner
 */
export const groupAccountsByOwner = (
    accounts: Account[]
): Record<string, OwnerGroup> => {
    const grouped: Record<string, OwnerGroup> = {};
    accounts.forEach((account) => {
        const ownerId = account.propietario_id || 'project';
        const ownerIdStr = String(ownerId);
        if (!grouped[ownerIdStr]) {
            grouped[ownerIdStr] = {
                ownerId,
                ownerName: getOwnerName(account),
                ownerType: account.propietario_type,
                accounts: [],
                totalBalance: 0,
            };
        }
        grouped[ownerIdStr].accounts.push(account);
        grouped[ownerIdStr].totalBalance += account.saldo_actual || 0;
    });
    return grouped;
};

/**
 * Calculate owner contributions from transactions
 */
export const calculateOwnerContributions = (
    transactions: Transaction[],
    accounts: Account[]
): Record<string, OwnerContribution> => {
    const contributions: Record<string, OwnerContribution> = {};

    transactions.forEach((transaction) => {
        const account = accounts.find((a) => a.id === transaction.cuenta_id);
        if (!account) return;

        const ownerId = account.propietario_id || 'project';
        const ownerIdStr = String(ownerId);
        if (!contributions[ownerIdStr]) {
            contributions[ownerIdStr] = {
                ownerId,
                ownerName: getOwnerName(account),
                income: 0,
                expense: 0,
                net: 0,
            };
        }

        const amount = transaction.monto || 0;
        if (amount > 0) {
            contributions[ownerIdStr].income += amount;
        } else {
            contributions[ownerIdStr].expense += Math.abs(amount);
        }
        contributions[ownerIdStr].net += amount;
    });

    return contributions;
};
