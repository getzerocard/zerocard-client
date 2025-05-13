import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Transaction } from '../../../types/transactions'; // Import the new Transaction type

// Helper function to format date and time
const formatDateTime = (isoString: string): { date: string; time: string } => {
  if (!isoString) return { date: 'N/A', time: 'N/A' };
  try {
    const dateObj = new Date(isoString);
    const date = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); // e.g., "May 3"
    const time = dateObj.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true }); // e.g., "11:30 PM"
    return { date, time };
  } catch (e) {
    console.error("Error formatting date:", e);
    return { date: 'Invalid Date', time: 'Invalid Time' };
  }
};

// Transaction types
export type TransactionType = 'deposit' | 'spend' | 'withdraw';

export interface TransactionItemProps {
  transaction: Transaction; // Use the imported Transaction type
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { date, time } = formatDateTime(transaction.dateAndTime);
  const currency = transaction.tokenInfo?.symbol || 'USDC'; // Assuming tokenInfo might have symbol
  const usdAmount = parseFloat(transaction.usdAmount);
  const nairaAmount = parseFloat(transaction.nairaAmount);

  // USDC icon SVG
  const usdcSvg = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.50041 16.4288C12.7978 16.4288 16.2546 12.8942 16.2546 8.50001C16.2546 4.10586 12.7978 0.571198 8.50041 0.571198C4.20303 0.571198 0.746216 4.10586 0.746216 8.50001C0.746216 12.8942 4.20303 16.4288 8.50041 16.4288Z" fill="#2775CA"/>
<path d="M10.6328 9.75514C10.6328 8.59912 9.95434 8.20268 8.59736 8.03697C7.62808 7.90455 7.43423 7.64053 7.43423 7.17828C7.43423 6.71603 7.75758 6.41869 8.4035 6.41869C8.98507 6.41869 9.30842 6.61691 9.4697 7.11247C9.50227 7.21158 9.5992 7.27739 9.69613 7.27739H10.2133C10.3428 7.27739 10.4398 7.17828 10.4398 7.04586V7.01256C10.3103 6.28549 9.72869 5.72413 8.98584 5.65832V4.86544C8.98584 4.73303 8.88892 4.63392 8.72763 4.60141H8.24299C8.1135 4.60141 8.01657 4.70052 7.98478 4.86544V5.62502C7.0155 5.75743 6.40137 6.4179 6.40137 7.24408C6.40137 8.3343 7.04729 8.76404 8.40428 8.92896C9.30919 9.09388 9.59997 9.2921 9.59997 9.82095C9.59997 10.3498 9.14791 10.7129 8.53377 10.7129C7.69399 10.7129 7.40321 10.3498 7.30628 9.85425C7.27372 9.72184 7.17679 9.65603 7.07986 9.65603H6.53087C6.40137 9.65603 6.30444 9.75514 6.30444 9.88755V9.92085C6.43394 10.747 6.95037 11.3417 8.01657 11.5066V12.2995C8.01657 12.4319 8.1135 12.531 8.27478 12.5635H8.75942C8.88892 12.5635 8.98584 12.4644 9.01764 12.2995V11.5066C9.98613 11.3409 10.6328 10.6471 10.6328 9.75514Z" fill="white"/>
<path d="M6.85257 13.224C4.33245 12.2987 3.03983 9.42451 3.97731 6.88095C4.46195 5.49341 5.52815 4.4365 6.85257 3.94094C6.98206 3.87514 7.04642 3.77603 7.04642 3.61031V3.14806C7.04642 3.01565 6.98206 2.91654 6.85257 2.88403C6.82 2.88403 6.75564 2.88403 6.72307 2.91733C3.65396 3.90844 1.97363 7.24488 2.9429 10.3839C3.52447 12.2337 4.91402 13.6545 6.72307 14.2492C6.85257 14.315 6.98129 14.2492 7.01385 14.1168C7.04642 14.0835 7.04642 14.051 7.04642 13.9844V13.5221C7.04642 13.4222 6.94949 13.2906 6.85257 13.224ZM10.2768 2.91654C10.1473 2.85073 10.0186 2.91654 9.98603 3.04895C9.95347 3.08225 9.95347 3.11476 9.95347 3.18136V3.64361C9.95347 3.77602 10.0504 3.90764 10.1473 3.97425C12.6674 4.89954 13.9601 7.77374 13.0226 10.3173C12.5379 11.7048 11.4717 12.7618 10.1473 13.2573C10.0178 13.3231 9.95347 13.4222 9.95347 13.5879V14.0502C9.95347 14.1826 10.0178 14.2817 10.1473 14.3142C10.1799 14.3142 10.2442 14.3142 10.2768 14.2809C13.3459 13.2898 15.0263 9.95337 14.057 6.81435C13.4754 4.93205 12.0541 3.5112 10.2768 2.91654Z" fill="white"/>
</svg>`;

  // Deposit Icon SVG (received)
  const depositIconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect y="0.00524902" width="16" height="16" rx="8" fill="white"/>
<path d="M7.99967 1.33862C4.31967 1.33862 1.33301 4.32529 1.33301 8.00529C1.33301 11.6853 4.31967 14.672 7.99967 14.672C11.6797 14.672 14.6663 11.6853 14.6663 8.00529C14.6663 4.32529 11.6797 1.33862 7.99967 1.33862ZM11.6863 5.02529L6.53967 10.172H8.55301C8.82634 10.172 9.05301 10.3986 9.05301 10.672C9.05301 10.9453 8.82634 11.172 8.55301 11.172H5.33301C5.05967 11.172 4.83301 10.9453 4.83301 10.672V7.45196C4.83301 7.17862 5.05967 6.95196 5.33301 6.95196C5.60634 6.95196 5.83301 7.17862 5.83301 7.45196V9.46529L10.9797 4.31862C11.0797 4.21862 11.2063 4.17196 11.333 4.17196C11.4597 4.17196 11.5863 4.21862 11.6863 4.31862C11.8797 4.51196 11.8797 4.83196 11.6863 5.02529Z" fill="#2FBA00"/>
</svg>`;

  // Spent Icon SVG (updated with new icon)
  const spentIconSvg = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="36" height="36" rx="18" fill="#E5E5E5"/>
<path d="M27.8218 20.1172C27.9307 19.4053 28 18.6948 28 18C28 16.541 27.7651 15.0752 27.3003 13.6387C26.8096 12.1416 25.4609 10.9854 23.7832 10.6231C19.998 9.79692 16 9.79792 12.2188 10.6221C10.5391 10.9854 9.1904 12.1416 8.6982 13.6426C8.2349 15.0752 8 16.541 8 18C8 19.459 8.2349 20.9248 8.6997 22.3613C9.1904 23.8584 10.5391 25.0146 12.2168 25.3769C14.0977 25.788 16.0093 25.9951 17.9175 25.9951C18.1443 25.9951 18.371 25.9833 18.5977 25.9773C18.9074 26.5925 19.3268 27.1429 19.8174 27.5712C19.855 27.6093 19.9287 27.6845 20.0381 27.7597C21.0005 28.5596 22.2266 29 23.5 29C24.8379 29 26.1172 28.5205 27.0894 27.6602C28.3037 26.623 29 25.1064 29 23.5C29 22.6387 28.7964 21.7842 28.4082 21.0215C28.2288 20.6736 28.0226 20.3622 27.8218 20.1172ZM12.6436 12.5762C14.396 12.1943 16.1982 12 18 12C19.8018 12 21.604 12.1943 23.3584 12.5771C24.3472 12.791 25.1294 13.4365 25.3984 14.2578C25.4781 14.5042 25.544 14.752 25.608 15H10.3918C10.4555 14.7532 10.5209 14.5066 10.6001 14.2617C10.8706 13.4365 11.6528 12.791 12.6436 12.5762ZM12.6416 23.4229C11.6528 23.209 10.8706 22.5635 10.6016 21.7422C10.2021 20.5078 10 19.249 10 18C10 17.6671 10.0166 17.3336 10.0452 17H25.9547C25.9833 17.3336 26 17.6671 26 18C26 18.1973 25.9946 18.3955 25.9844 18.5947C25.9499 18.5771 25.9131 18.565 25.8783 18.5482C25.8065 18.5134 25.733 18.484 25.6599 18.4524C25.5075 18.3868 25.3533 18.3275 25.1957 18.2761C25.1145 18.2496 25.0333 18.2245 24.9509 18.2019C24.7883 18.1573 24.6236 18.1222 24.457 18.0928C24.3818 18.0795 24.3078 18.0629 24.232 18.0528C23.9904 18.0206 23.7466 18 23.5 18C21.8926 18 20.3765 18.6963 19.3511 19.8975C18.48 20.8828 18 22.1621 18 23.5C18 23.667 18.0073 23.832 18.0215 23.9951C16.231 23.9941 14.4185 23.8115 12.6416 23.4229ZM25.7773 26.1514C24.5585 27.2276 22.5166 27.25 21.2807 26.1914C21.2558 26.1699 21.2294 26.1494 21.2026 26.1299C21.1997 26.1279 21.1958 26.124 21.1904 26.1192C20.7314 25.7159 20.3882 25.2042 20.188 24.6133C20.0635 24.2754 20 23.9014 20 23.5C20 22.6504 20.3018 21.8418 20.8604 21.209C21.9546 19.9278 23.9712 19.624 25.4161 20.5762C25.6344 20.7139 25.835 20.8848 26.0128 21.085C26.0406 21.1162 26.0709 21.1455 26.1031 21.1739L26.2144 21.3038C26.3672 21.4854 26.5074 21.6993 26.629 21.9337C26.8716 22.4111 27 22.9531 27 23.5C27 24.5205 26.5591 25.4834 25.7773 26.1514Z" fill="black"/>
<path d="M14 20H13C12.4478 20 12 20.4473 12 21C12 21.5527 12.4478 22 13 22H14C14.5522 22 15 21.5527 15 21C15 20.4473 14.5522 20 14 20ZM24.293 22.293L23 23.5859L22.707 23.2929C22.3164 22.9023 21.6836 22.9023 21.2929 23.2929C20.9022 23.6835 20.9023 24.3163 21.2929 24.707L22.2929 25.707C22.4883 25.9023 22.7441 26 23 26C23.2559 26 23.5117 25.9023 23.707 25.707L25.707 23.707C26.0976 23.3164 26.0976 22.6836 25.707 22.2929C25.3164 21.9022 24.6836 21.9023 24.293 22.293Z" fill="black"/>
</svg>`;

  // Withdraw Icon SVG (new icon)
  const withdrawIconSvg = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="36" height="36" rx="18" fill="#E5E5E5"/>
<path d="M10.1047 15.8534C9.89368 18.5127 10.0541 21.1764 10.6226 23.7813C10.9863 25.4614 12.1421 26.8096 13.6426 27.3018C15.0771 27.7651 16.543 28 18 28C19.457 28 20.9229 27.7651 22.3613 27.3003C23.8579 26.8096 25.0137 25.4614 25.3769 23.7832C25.7905 21.8916 26 19.9458 26 18C26 17.2828 25.9618 16.5634 25.905 15.8482C27.1667 15.2033 28 13.9576 28 12.5801V12.02C28 11.0981 27.6313 10.2061 26.9473 9.49316C26.2749 8.8208 25.3779 8.40234 24.4292 8.31494C20.228 7.89697 15.771 7.89697 11.5718 8.31494C9.53564 8.51562 8 10.1084 8 12.02V12.5801C8 13.502 8.36865 14.394 9.0625 15.1167C9.37158 15.4173 9.72626 15.6608 10.1047 15.8534ZM23.4224 23.3584C23.2085 24.3472 22.563 25.1294 21.7422 25.3984C19.2715 26.1973 16.7246 26.1958 14.2617 25.3999C13.437 25.1294 12.7915 24.3472 12.5771 23.3564C12 20.7124 11.8545 18.0039 12.144 15.3071C12.2275 14.5308 12.3467 13.7607 12.5015 13H23.4985C23.6518 13.752 23.772 14.5264 23.8559 15.3071C23.9517 16.1958 24 17.1016 24 18C24 19.8023 23.8057 21.6045 23.4224 23.3584ZM10 12.02C10 11.1416 10.7603 10.4048 11.769 10.3052C13.8042 10.1025 15.9004 10 18 10C20.0996 10 22.1958 10.1025 24.2388 10.3057C24.731 10.3511 25.1904 10.5645 25.5186 10.8926C25.7383 11.1216 26 11.5029 26 12.02V12.5801C26 12.9395 25.8667 13.2827 25.6367 13.5679C25.562 13.1148 25.4761 12.6689 25.3809 12.2358C25.3413 12.0366 25.2886 11.8511 25.2227 11.665C25.0811 11.2666 24.7036 11 24.2803 11H11.7197C11.2964 11 10.9189 11.2666 10.7773 11.665C10.7114 11.8511 10.6587 12.0366 10.6235 12.2153C10.5254 12.6606 10.4385 13.1138 10.3628 13.5723C10.1773 13.3398 10 13.0059 10 12.5801V12.02Z" fill="black"/>
<path d="M19.293 19.293L19 19.5859V16.1626C19 15.6103 18.5522 15.1626 18 15.1626C17.4477 15.1626 17 15.6103 17 16.1626V19.5859L16.707 19.293C16.3164 18.9023 15.6836 18.9023 15.293 19.293C14.9023 19.6836 14.9023 20.3164 15.293 20.707L17.293 22.707C17.4883 22.9023 17.7441 23 18 23C18.2559 23 18.5117 22.9023 18.707 22.707L20.707 20.707C21.0976 20.3164 21.0976 19.6836 20.707 19.293C20.3164 18.9023 19.6836 18.9023 19.293 19.293Z" fill="black"/>
</svg>`;

  // Determine UI based on transaction type from API
  let iconSvg;
  let title;
  let amountText;
  let amountTagStyle;

  switch (transaction.transactionType.toLowerCase()) {
    case 'deposit': // Assuming 'deposit' will be a value for transactionType
      title = `You deposited ${usdAmount.toFixed(2)} ${currency}`;
      amountText = `+${usdAmount.toFixed(2)} ${currency}`;
      amountTagStyle = styles.depositAmountTag;
      iconSvg = (
        <View style={styles.depositIconGroup}>
          <SvgXml xml={usdcSvg} width={35} height={35} style={styles.usdcIcon} />
          <View style={styles.receivedIconContainer}>
            <SvgXml xml={depositIconSvg} width={16} height={16} />
          </View>
        </View>
      );
      break;
    case 'withdrawal': // Assuming 'withdrawal' will be a value for transactionType
      title = `Withdrew ${usdAmount.toFixed(2)} ${currency}`;
      amountText = `-${usdAmount.toFixed(2)} ${currency}`;
      amountTagStyle = styles.withdrawAmountTag;
      iconSvg = (
        <View style={styles.iconContainer}>
          <SvgXml xml={withdrawIconSvg} width={36} height={36} />
        </View>
      );
      break;
    case 'spending':
    default:
      // Default to spending if type is not recognized or is 'spending'
      const merchantName = transaction.merchant?.merchantName || transaction.category || 'Purchase';
      title = `Spent ${usdAmount.toFixed(2)} ${currency} at ${merchantName}`;
      // For spending, API provides nairaAmount directly
      amountText = `-₦${nairaAmount.toFixed(2)}`;
      amountTagStyle = styles.spendAmountTag;
      iconSvg = (
        <View style={styles.iconContainer}>
          <SvgXml xml={spentIconSvg} width={36} height={36} />
        </View>
      );
      break;
  }

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        {/* Icon */}
        {iconSvg}

        {/* Transaction details */}
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>{date}</Text>
            {time !== 'N/A' && <Text style={styles.metaText}>{time}</Text>}
          </View>
        </View>
      </View>

      {/* Amount tag */}
      <View style={[styles.amountTag, amountTagStyle]}>
        <Text style={styles.amountText}>{amountText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  depositIconGroup: {
    position: 'relative',
    width: 37,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  usdcIcon: {
    position: 'absolute',
  },
  receivedIconContainer: {
    position: 'absolute',
    width: 16,
    height: 16,
    right: -2,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flexShrink: 1,
    maxWidth: '70%',
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#121212',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 2,
  },
  metaText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#838383',
  },
  amountTag: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 1000,
    borderWidth: 1,
    borderStyle: 'dashed',
    minWidth: 80,
    flexShrink: 0,
  },
  depositAmountTag: {
    borderColor: '#38E100',
    backgroundColor: 'rgba(56, 225, 0, 0.1)',
  },
  spendAmountTag: {
    borderColor: '#BCBCBC',
    backgroundColor: 'rgba(188, 188, 188, 0.1)',
  },
  withdrawAmountTag: {
    borderColor: '#C9252D',
    backgroundColor: 'rgba(201, 37, 45, 0.1)',
  },
  amountText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    color: '#000000',
  },
});
