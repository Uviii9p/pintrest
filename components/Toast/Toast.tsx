'use client';

import { useNotification } from '@/context/NotificationContext';
import styles from './Toast.module.css';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function Toast() {
    const { notifications, removeNotification } = useNotification();

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className={styles.successIcon} />;
            case 'error':
                return <AlertCircle className={styles.errorIcon} />;
            case 'warning':
                return <AlertCircle className={styles.warningIcon} />;
            default:
                return <Info className={styles.infoIcon} />;
        }
    };

    return (
        <div className={styles.container}>
            {notifications.map((notif) => (
                <div key={notif.id} className={`${styles.toast} ${styles[notif.type]}`}>
                    <div className={styles.content}>
                        {getIcon(notif.type)}
                        <p>{notif.message}</p>
                    </div>
                    <button
                        className={styles.closeBtn}
                        onClick={() => removeNotification(notif.id)}
                    >
                        <X size={18} />
                    </button>
                </div>
            ))}
        </div>
    );
}
