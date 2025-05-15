import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SquircleView } from 'react-native-figma-squircle';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { Button } from '../../ui/Button'; // Corrected path
import { useProcessWithdrawal } from '../../../common/hooks/useProcessWithdrawal'; // Import the hook
import { LoadingSpinner } from '../../ui/feedback/LoadingSpinner'; // Import LoadingSpinner

// --- SVG Icons ---
// Replace with actual SVG content or imports
const backIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M15 20.67C14.81 20.67 14.62 20.6 14.47 20.45L7.95003 13.93C6.89003 12.87 6.89003 11.13 7.95003 10.07L14.47 3.55002C14.76 3.26002 15.24 3.26002 15.53 3.55002C15.82 3.84002 15.82 4.32002 15.53 4.61002L9.01003 11.13C8.53003 11.61 8.53003 12.39 9.01003 12.87L15.53 19.39C15.82 19.68 15.82 20.16 15.53 20.45C15.38 20.59 15.19 20.67 15 20.67Z" fill="#FAFAFA"/>
</svg>`;
const withdrawArrowUpSvg = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="17" y="16.457" width="16.4571" height="16.4571" rx="8.22857" transform="rotate(180 17 16.457)" fill="white"/><path d="M8.77127 15.0857C12.5564 15.0857 15.6284 12.0137 15.6284 8.22855C15.6284 4.44341 12.5564 1.37141 8.77127 1.37141C4.98613 1.37141 1.91413 4.44341 1.91413 8.22855C1.91413 12.0137 4.98613 15.0857 8.77127 15.0857ZM4.97927 11.2937L10.273 5.99998H8.20213C7.92099 5.99998 7.68785 5.76684 7.68785 5.48569C7.68785 5.20455 7.92099 4.97141 8.20213 4.97141H11.5141C11.7953 4.97141 12.0284 5.20455 12.0284 5.48569V8.79769C12.0284 9.07884 11.7953 9.31198 11.5141 9.31198C11.233 9.31198 10.9998 9.07884 10.9998 8.79769V6.72684L5.70613 12.0206C5.60327 12.1234 5.47299 12.1714 5.3427 12.1714C5.21242 12.1714 5.08213 12.1234 4.97927 12.0206C4.78042 11.8217 4.78042 11.4925 4.97927 11.2937Z" fill="#C9252D"/></svg>`;
const usdcLargeIconSvg = `<svg width="48" height="48" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.50041 16.4288C12.7978 16.4288 16.2546 12.8942 16.2546 8.50001C16.2546 4.10586 12.7978 0.571198 8.50041 0.571198C4.20303 0.571198 0.746216 4.10586 0.746216 8.50001C0.746216 12.8942 4.20303 16.4288 8.50041 16.4288Z" fill="#2775CA"/>
<path d="M10.6328 9.75514C10.6328 8.59912 9.95434 8.20268 8.59736 8.03697C7.62808 7.90455 7.43423 7.64053 7.43423 7.17828C7.43423 6.71603 7.75758 6.41869 8.4035 6.41869C8.98507 6.41869 9.30842 6.61691 9.4697 7.11247C9.50227 7.21158 9.5992 7.27739 9.69613 7.27739H10.2133C10.3428 7.27739 10.4398 7.17828 10.4398 7.04586V7.01256C10.3103 6.28549 9.72869 5.72413 8.98584 5.65832V4.86544C8.98584 4.73303 8.88892 4.63392 8.72763 4.60141H8.24299C8.1135 4.60141 8.01657 4.70052 7.98478 4.86544V5.62502C7.0155 5.75743 6.40137 6.4179 6.40137 7.24408C6.40137 8.3343 7.04729 8.76404 8.40428 8.92896C9.30919 9.09388 9.59997 9.2921 9.59997 9.82095C9.59997 10.3498 9.14791 10.7129 8.53377 10.7129C7.69399 10.7129 7.40321 10.3498 7.30628 9.85425C7.27372 9.72184 7.17679 9.65603 7.07986 9.65603H6.53087C6.40137 9.65603 6.30444 9.75514 6.30444 9.88755V9.92085C6.43394 10.747 6.95037 11.3417 8.01657 11.5066V12.2995C8.01657 12.4319 8.1135 12.531 8.27478 12.5635H8.75942C8.88892 12.5635 8.98584 12.4644 9.01764 12.2995V11.5066C9.98613 11.3409 10.6328 10.6471 10.6328 9.75514Z" fill="white"/>
</svg>`;
const usdcSvg = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8.50041 16.4288C12.7978 16.4288 16.2546 12.8942 16.2546 8.50001C16.2546 4.10586 12.7978 0.571198 8.50041 0.571198C4.20303 0.571198 0.746216 4.10586 0.746216 8.50001C0.746216 12.8942 4.20303 16.4288 8.50041 16.4288Z" fill="#2775CA"/>
  <path d="M10.6328 9.75514C10.6328 8.59912 9.95434 8.20268 8.59736 8.03697C7.62808 7.90455 7.43423 7.64053 7.43423 7.17828C7.43423 6.71603 7.75758 6.41869 8.4035 6.41869C8.98507 6.41869 9.30842 6.61691 9.4697 7.11247C9.50227 7.21158 9.5992 7.27739 9.69613 7.27739H10.2133C10.3428 7.27739 10.4398 7.17828 10.4398 7.04586V7.01256C10.3103 6.28549 9.72869 5.72413 8.98584 5.65832V4.86544C8.98584 4.73303 8.88892 4.63392 8.72763 4.60141H8.24299C8.1135 4.60141 8.01657 4.70052 7.98478 4.86544V5.62502C7.0155 5.75743 6.40137 6.4179 6.40137 7.24408C6.40137 8.3343 7.04729 8.76404 8.40428 8.92896C9.30919 9.09388 9.59997 9.2921 9.59997 9.82095C9.59997 10.3498 9.14791 10.7129 8.53377 10.7129C7.69399 10.7129 7.40321 10.3498 7.30628 9.85425C7.27372 9.72184 7.17679 9.65603 7.07986 9.65603H6.53087C6.40137 9.65603 6.30444 9.75514 6.30444 9.88755V9.92085C6.43394 10.747 6.95037 11.3417 8.01657 11.5066V12.2995C8.01657 12.4319 8.1135 12.531 8.27478 12.5635H8.75942C8.88892 12.5635 8.98584 12.4644 9.01764 12.2995V11.5066C9.98613 11.3409 10.6328 10.6471 10.6328 9.75514Z" fill="white"/>
  <path d="M6.85257 13.224C4.33245 12.2987 3.03983 9.42451 3.97731 6.88095C4.46195 5.49341 5.52815 4.4365 6.85257 3.94094C6.98206 3.87514 7.04642 3.77603 7.04642 3.61031V3.14806C7.04642 3.01565 6.98206 2.91654 6.85257 2.88403C6.82 2.88403 6.75564 2.88403 6.72307 2.91733C3.65396 3.90844 1.97363 7.24488 2.9429 10.3839C3.52447 12.2337 4.91402 13.6545 6.72307 14.2492C6.85257 14.315 6.98129 14.2492 7.01385 14.1168C7.04642 14.0835 7.04642 14.051 7.04642 13.9844V13.5221C7.04642 13.4222 6.94949 13.2906 6.85257 13.224ZM10.2768 2.91654C10.1473 2.85073 10.0186 2.91654 9.98603 3.04895C9.95347 3.08225 9.95347 3.11476 9.95347 3.18136V3.64361C9.95347 3.77602 10.0504 3.90764 10.1473 3.97425C12.6674 4.89954 13.9601 7.77374 13.0226 10.3173C12.5379 11.7048 11.4717 12.7618 10.1473 13.2573C10.0178 13.3231 9.95347 13.4222 9.95347 13.5879V14.0502C9.95347 14.1826 10.0178 14.2817 10.1473 14.3142C10.1799 14.3142 10.2442 14.3142 10.2768 14.2809C13.3459 13.2898 15.0263 9.95337 14.057 6.81435C13.4754 4.93205 12.0541 3.5112 10.2768 2.91654Z" fill="white"/>
</svg>`;
const totalValueCoinSvg = `<svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.2074 12.1688L17.2077 12.1663C17.33 11.6378 17.1737 11.0933 16.7902 10.7099C16.4072 10.3261 15.8626 10.1712 15.3302 10.2924L14.8585 10.4044C14.7702 10.4205 14.6886 10.4422 14.575 10.4737C13.1776 10.8131 11.8372 11.3288 10.5972 12.0029C10.0051 12.3183 9.67879 12.9522 9.76521 13.6176C9.852 14.2848 10.3321 14.8158 10.9924 14.9707L12.1445 15.2344L12.2271 15.2255C12.2329 15.2319 12.2349 15.2402 12.241 15.2465L12.5286 16.5066C12.6956 17.2387 13.3387 17.7499 14.0924 17.7499C14.6871 17.7499 15.2115 17.4339 15.4946 16.9069C16.2138 15.5783 16.75 14.1541 17.0876 12.6786L17.2074 12.1688ZM15.6264 12.3399C15.3181 13.6875 14.8299 14.9835 14.1744 16.195C14.1103 16.3144 14.01 16.2576 13.9913 16.173L13.6983 14.8902C13.6967 14.8829 13.6923 14.877 13.6905 14.8697L14.4051 14.1552C14.6981 13.8622 14.6981 13.3876 14.4051 13.0946C14.1121 12.8017 13.6375 12.8017 13.3446 13.0946L12.6296 13.8096C12.6209 13.8075 12.6139 13.8023 12.6052 13.8003L11.3315 13.5095C11.3088 13.5044 11.2616 13.4934 11.2528 13.4238C11.244 13.3579 11.2821 13.3374 11.3081 13.3235C12.4397 12.7086 13.658 12.2402 14.9295 11.9312C14.9369 11.9293 14.9951 11.9136 15.0028 11.9114C15.0442 11.9 15.0833 11.8879 15.1646 11.8722L15.7293 11.77C15.7531 11.7938 15.7491 11.8162 15.7465 11.8275L15.6264 12.3399Z" fill="#898989"/><path d="M2.28735 10.8392C2.2873 10.8486 2.29211 10.8579 2.29243 10.8673C2.29275 10.8775 2.28844 10.8868 2.28918 10.8971C2.328 11.4285 2.38184 11.9602 2.45178 12.4974C2.50671 12.8948 2.56934 13.2917 2.64661 13.6814C2.6803 13.8498 2.77075 14.0018 2.90296 14.1117C3.81775 14.8723 5.79236 15.385 8.18482 15.4831C8.19544 15.4835 8.20569 15.4839 8.21594 15.4839C8.61621 15.4839 8.94836 15.1682 8.96485 14.7646C8.98206 14.3508 8.66016 14.0015 8.24634 13.9846C6.19739 13.9004 4.73072 13.4998 4.06348 13.0987C4.02581 12.8876 3.99247 12.6755 3.96213 12.4643C5.02222 12.8949 6.52579 13.1688 8.21008 13.2346C8.21997 13.235 8.22986 13.2353 8.23975 13.2353C8.64038 13.2353 8.9729 12.9186 8.98865 12.5146C9.00513 12.1008 8.68287 11.7522 8.26868 11.7361C6.75073 11.6764 5.37049 11.4292 4.48682 11.0604C4.3857 11.0172 4.30174 10.9763 4.22553 10.9369C4.20392 10.9257 4.18401 10.9148 4.16419 10.904C4.10902 10.8739 4.05949 10.8449 4.01747 10.818C4.00667 10.8111 3.9938 10.8036 3.98378 10.7969C3.93494 10.7642 3.89452 10.734 3.86275 10.7076C3.85698 10.7029 3.85286 10.699 3.84764 10.6944C3.82183 10.672 3.80036 10.6517 3.78512 10.6353C3.78342 10.6335 3.78154 10.6315 3.77998 10.6298L3.77198 10.4239C3.76721 10.3258 3.76319 10.228 3.76026 10.1306C3.80677 10.1515 3.85438 10.172 3.90345 10.1921C5.13244 10.7056 6.99023 11 9 11C11.0098 11 12.8676 10.7056 14.0944 10.1932C14.9967 9.82007 15.5369 9.33081 15.7002 8.73938C15.7181 8.67456 15.7273 8.60718 15.7273 8.5398V8.53247C15.7273 8.51709 15.7269 8.50207 15.7258 8.48669L15.7126 8.16039C15.7126 8.14135 15.7119 8.12231 15.7108 8.1029C15.672 7.57153 15.6182 7.03979 15.5489 6.50841L15.548 6.50512L15.5482 6.50256C15.4933 6.10522 15.4307 5.70825 15.3534 5.3186C15.3197 5.15014 15.2292 4.99816 15.097 4.8883C14.0673 4.0321 11.7308 3.5 9 3.5C6.26917 3.5 3.93274 4.0321 2.90296 4.8883C2.77075 4.99817 2.6803 5.15015 2.64661 5.3186C2.56934 5.70826 2.50672 6.10522 2.45178 6.50256L2.45197 6.50513L2.45105 6.50842C2.38183 7.0398 2.328 7.57153 2.28919 8.10291C2.28809 8.12232 2.28736 8.14136 2.28736 8.1604L2.27422 8.50052L2.27344 8.50391C2.25769 8.83862 2.25 9.16528 2.25 9.5C2.25 9.83472 2.25769 10.1614 2.27417 10.5133L2.28735 10.8392ZM9 9.5C7.20813 9.5 5.5188 9.24145 4.47913 8.80676C4.37801 8.76492 4.29437 8.72478 4.21843 8.68596C4.19824 8.67561 4.17893 8.6655 4.16039 8.65543C4.10019 8.62283 4.04622 8.59138 4.00177 8.56236C3.99577 8.55847 3.9878 8.55403 3.98204 8.55018C3.93383 8.51791 3.89643 8.48899 3.86517 8.46289C3.85574 8.45502 3.84741 8.4477 3.83936 8.44051C3.81857 8.42183 3.80054 8.40462 3.78776 8.39084C3.7852 8.38809 3.78158 8.38462 3.77934 8.3821L3.78406 8.26221C3.78882 8.22669 3.79102 8.19116 3.79065 8.15527C3.79065 8.15125 3.79065 8.14722 3.79065 8.14319C3.79651 8.06262 3.8031 7.98206 3.80969 7.90149C3.84046 7.91504 3.87158 7.92858 3.90344 7.94214C5.13244 8.45556 6.99023 8.75 9 8.75C11.0098 8.75 12.8676 8.45556 14.1017 7.93994C14.1313 7.92712 14.161 7.91431 14.1903 7.90149C14.1969 7.98205 14.2035 8.06262 14.2094 8.14319C14.2094 8.14722 14.2094 8.15125 14.2094 8.15527C14.209 8.19116 14.2112 8.22668 14.2159 8.26221L14.2207 8.37972C14.2184 8.38233 14.2153 8.38544 14.2127 8.38823C14.1993 8.40301 14.1806 8.42114 14.1588 8.44087C14.1515 8.44746 14.1447 8.45373 14.1363 8.46078C14.105 8.48729 14.0664 8.51695 14.0182 8.54941C14.01 8.55495 13.999 8.56117 13.9902 8.5669C13.9473 8.59473 13.8963 8.62452 13.8393 8.65547C13.8201 8.66591 13.8003 8.67639 13.7793 8.68715C13.7034 8.72597 13.6197 8.76607 13.5187 8.80786C12.4812 9.24145 10.7919 9.5 9 9.5ZM9 5C11.3199 5 13.155 5.43359 13.9365 5.90161C13.9606 6.03523 13.9825 6.16995 14.0037 6.30504C13.97 6.32715 13.927 6.3515 13.8849 6.37567C13.8585 6.39087 13.8378 6.40474 13.8078 6.42067C13.7256 6.4642 13.6307 6.51012 13.5187 6.55786C12.4812 6.99145 10.7919 7.25 9 7.25C7.20813 7.25 5.5188 6.99145 4.48645 6.56006C4.37296 6.51168 4.27693 6.46526 4.19394 6.42136C4.1667 6.40694 4.14826 6.39444 4.12395 6.38061C4.07817 6.35457 4.0324 6.32857 3.99632 6.3049C4.01747 6.16987 4.0394 6.03519 4.06348 5.90161C4.84497 5.43359 6.68006 5 9 5Z" fill="#898989"/></svg>`;
const chainIconSvg = `<svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.43573 12.7604C2.72747 12.8271 2.10565 13.2028 1.77313 13.7653C1.40765 14.382 1.40765 15.1181 1.77313 15.7337C2.10565 16.2973 2.72747 16.673 3.43573 16.7397C5.28217 16.9129 7.14105 16.9997 8.99994 16.9997C10.8588 16.9997 12.7177 16.9129 14.5642 16.7397C15.2724 16.673 15.8942 16.2973 16.2268 15.7348C16.5922 15.1181 16.5922 14.382 16.2268 13.7664C15.8942 13.2028 15.2724 12.8271 14.5642 12.7604C14.4597 12.7506 14.3545 12.7476 14.2499 12.7384V7.75498C14.7807 7.70577 15.3109 7.65075 15.84 7.58661C16.1191 7.55292 16.3557 7.36579 16.4538 7.10211C16.5512 6.83844 16.4926 6.54218 16.3029 6.33527L16.007 6.013C14.1335 3.96735 11.7656 2.586 9.15962 2.01727C9.05415 1.99457 8.94575 1.99457 8.84028 2.01727C6.23432 2.586 3.8664 3.96735 1.99287 6.01263L1.69697 6.33527C1.50727 6.54218 1.44868 6.83844 1.54609 7.10211C1.64423 7.36578 1.88081 7.55292 2.15986 7.58661C2.68898 7.65075 3.21921 7.70577 3.74994 7.75498V12.7384C3.64544 12.7476 3.5402 12.7506 3.43573 12.7604ZM14.9362 14.5307C15.0219 14.6743 15.0219 14.8259 14.9355 14.9705C14.8491 15.117 14.6484 15.225 14.4235 15.2463C10.8244 15.5839 7.17401 15.5839 3.57635 15.2463C3.3515 15.225 3.15082 15.117 3.06366 14.9694C2.97797 14.8259 2.97797 14.6743 3.0644 14.5296C3.15082 14.3831 3.3515 14.2751 3.57636 14.2539C5.37592 14.085 7.18793 14.0004 8.99994 14.0004C10.812 14.0004 12.6247 14.085 14.4235 14.2539C14.6484 14.2751 14.8491 14.3831 14.9362 14.5307ZM12.7499 12.6331C11.7514 12.5703 10.7514 12.5307 9.74994 12.5181V7.98803C10.7507 7.97484 11.7511 7.93763 12.7499 7.87167V12.6331ZM8.99994 3.51911C10.9006 3.96296 12.6555 4.90229 14.1364 6.26093C10.7219 6.5788 7.27802 6.5788 3.86346 6.26093C5.34443 4.90229 7.09931 3.96296 8.99994 3.51911ZM5.24994 7.87167C6.24878 7.93763 7.24918 7.97484 8.24994 7.98803V12.5181C7.24845 12.5307 6.24851 12.5703 5.24994 12.6331V7.87167Z" fill="#898989"/></svg>`;
const feeDetailsSvg = `<svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.5359 4.49618C14.437 3.98788 14.247 3.51546 13.9712 3.09139C13.7522 2.75448 13.3054 2.64974 12.9597 2.85482L11.9794 3.4371L10.8518 2.83797C10.6314 2.72079 10.3684 2.72079 10.148 2.83797L8.99989 3.44736L7.85182 2.83798C7.63136 2.72079 7.36842 2.72079 7.14796 2.83798L6.02039 3.4371L5.04005 2.85483C4.69435 2.64975 4.24757 2.75448 4.02857 3.0914C3.75282 3.51547 3.56276 3.98788 3.46535 4.48886C2.84755 7.49106 2.84755 10.6654 3.46498 13.6661C3.73414 14.9874 4.59657 16.0501 5.71864 16.4412C6.7975 16.8119 7.90126 17.0001 8.99989 17.0001C10.0985 17.0001 11.2023 16.8119 12.2841 16.4405C13.4032 16.0501 14.2656 14.9874 14.5344 13.6676C14.8432 12.1661 14.9999 10.6222 14.9999 9.07821C14.9999 7.53427 14.8432 5.99032 14.5359 4.49618ZM13.0648 13.3673C12.9008 14.1722 12.4126 14.8072 11.7933 15.0233C9.95131 15.6561 8.04554 15.6554 6.20936 15.024C5.58717 14.8072 5.09901 14.1722 4.93458 13.3658C4.35743 10.5606 4.35743 7.59579 4.93604 4.78329C4.95032 4.71005 4.96754 4.63827 4.98768 4.56796L5.6172 4.94223C5.84169 5.07552 6.12038 5.08139 6.35182 4.95907L7.49989 4.3497L8.64796 4.95907C8.86842 5.07626 9.13136 5.07626 9.35182 4.95907L10.4999 4.3497L11.648 4.95907C11.8798 5.08212 12.1581 5.07626 12.3826 4.94223L13.0121 4.56869C13.0326 4.64046 13.0505 4.71517 13.0652 4.79061C13.3538 6.1932 13.4999 7.63608 13.4999 9.07821C13.4999 10.5204 13.3538 11.9632 13.0648 13.3673Z" fill="#898989"/><path d="M6.75 8.75H8.22143C8.63562 8.75 8.97143 8.41455 8.97143 8C8.97143 7.58545 8.63562 7.25 8.22143 7.25H6.75C6.33581 7.25 6 7.58545 6 8C6 8.41455 6.33581 8.75 6.75 8.75ZM9.75 9.5H6.75C6.33581 9.5 6 9.83545 6 10.25C6 10.6645 6.33581 11 6.75 11H9.75C10.1642 11 10.5 10.6645 10.5 10.25C10.5 9.83545 10.1642 9.5 9.75 9.5Z" fill="#898989"/></svg>`;
const infoCircleSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#989898"/><path d="M12 8V13" stroke="#343434" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.9945 16H12.0035" stroke="#343434" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`; // Placeholder
const padlockSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.3333 6V4.66667C11.3333 2.82667 9.84 1.33333 8 1.33333C6.16 1.33333 4.66667 2.82667 4.66667 4.66667V6C3.53333 6 2.66667 6.86667 2.66667 8V12.6667C2.66667 13.7333 3.53333 14.6667 4.66667 14.6667H11.3333C12.4667 14.6667 13.3333 13.7333 13.3333 12.6667V8C13.3333 6.86667 12.4667 6 11.3333 6ZM6 4.66667C6 3.57333 6.89333 2.66667 8 2.66667C9.10667 2.66667 10 3.57333 10 4.66667V6H6V4.66667Z" fill="black"/></svg>`;
// --- ---

// Helper function to truncate address
const truncateAddress = (address: string | null) => {
  if (!address) return '········';
  return `${address.substring(0, 6)}..${address.substring(address.length - 4)}`;
};

export default function WithdrawConfirmation() {
  // Retrieve all necessary parameters passed from WithdrawForm
  const { 
    amount = '0', 
    address = '', 
    tokenSymbol = 'USDC', 
    chainType = 'ethereum', 
  } = useLocalSearchParams<{
    amount?: string;
    address?: string;
    tokenSymbol?: 'USDC'; // Adjust if other tokens are supported
    chainType?: 'ethereum' | 'solana'; // Adjust if other chains are supported
  }>();
//TODO: Chnage to Base on Prod
  // Hardcode blockchainNetwork
  const blockchainNetwork = 'Base';

  // Use the withdrawal mutation hook
  const {
    mutate: processWithdrawal,
    isPending: isProcessingWithdrawal,
    error: withdrawalError,
  } = useProcessWithdrawal();

  const handleBack = () => {
    if (isProcessingWithdrawal) return; // Don't allow back navigation while processing

    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback if cannot go back (e.g., deep link)
      router.replace('/(tab)/home');
    }
  };

  const handleConfirm = () => {
    console.log('Confirming withdrawal with params:', { amount, address, tokenSymbol, chainType, blockchainNetwork });

    if (!address || !amount || !tokenSymbol || !chainType || !blockchainNetwork) {
      Alert.alert('Error', 'Missing withdrawal details.');
      return;
    }

    const params = {
      tokenSymbol,
      amount,
      recipientAddress: address,
      chainType,
      blockchainNetwork,
    };

    processWithdrawal(params, {
      onSuccess: (data) => {
        console.log('Withdrawal successful:', data);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Pass success info back to the home screen for a toast/message
        router.replace({
          pathname: '/(tab)/home',
          params: {
            showWithdrawalToast: 'true',
            amount: data.data.amount,
            address: data.data.to,
            txHash: data.data.transactionHash,
          },
        });
      },
      onError: (error) => {
        console.error('Withdrawal failed:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Withdrawal Failed', error.message || 'An unexpected error occurred.');
      },
    });
  };

  // Log the loading state to debug spinner visibility
  console.log('[WithdrawConfirmation] isProcessingWithdrawal:', isProcessingWithdrawal);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <SvgXml xml={backIconSvg} width={24} height={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.titleSection}>
            <View style={styles.iconContainer}>
              <SvgXml xml={usdcSvg} width={48} height={48} style={styles.baseIconSvg} />
              <SvgXml
                xml={withdrawArrowUpSvg}
                width={16.46}
                height={16.46}
                style={styles.overlayIconSvg}
              />
            </View>
            <Text style={styles.titleText}>
              Confirm withdrawal of {amount} USDC to{'\n'}
              {truncateAddress(address)}
            </Text>
            {/* Display API error message if present */}
            {withdrawalError && (
                <Text style={styles.errorText}>{withdrawalError.message}</Text>
            )}
          </View>

          <View style={styles.detailsSection}>
            {/* Box 1: Value, Chain, Fee */}
            <SquircleView
              style={styles.infoBox}
              squircleParams={{
                cornerSmoothing: 1,
                cornerRadius: 20,
                fillColor: '#343434',
              }}>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <SvgXml xml={usdcSvg} width={17} height={17} />
                  <Text style={styles.detailLabel}>Total Value</Text>
                </View>
                <Text style={styles.detailValue}>{amount} USDC</Text>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <SvgXml xml={chainIconSvg} width={18} height={18} />
                  <Text style={styles.detailLabel}>Chain</Text>
                </View>
                <Text style={styles.detailValue}>{blockchainNetwork}</Text>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <SvgXml xml={feeDetailsSvg} width={18} height={18} />
                  <Text style={styles.detailLabel}>Fee</Text>
                </View>
                <Text style={styles.detailValue}>~$0.1</Text>
              </View>
            </SquircleView>

            {/* Box 2: Info/Warning */}
            <SquircleView
              style={styles.warningBox}
              squircleParams={{
                cornerSmoothing: 1,
                cornerRadius: 20,
                fillColor: '#343434',
              }}>
              <SvgXml xml={infoCircleSvg} width={24} height={24} />
              <Text style={styles.warningText}>
                Only withdraw to an address on {blockchainNetwork}, this wallet currently only holds USDC asset on
                {blockchainNetwork}
              </Text>
            </SquircleView>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmButtonBase,
              isProcessingWithdrawal ? styles.confirmButtonDisabled : styles.confirmButtonActive,
            ]}
            onPress={handleConfirm}
            disabled={isProcessingWithdrawal}
          >
            {isProcessingWithdrawal ? (
              <LoadingSpinner size="small" color="#000000" useLottie={false} />
            ) : (
              <View style={styles.buttonContent}>
                <SvgXml xml={padlockSvg} width={16} height={16} />
                <Text style={styles.confirmButtonText}>Confirm withdrawal</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1f1f1f', // Match WithdrawForm background
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 40,
    paddingBottom: 20, // Consistent padding like withdraw-funds
    justifyContent: 'space-between', // Push header/content up, footer down
  },
  header: {
    marginBottom: 32, // Gap between header and main content
  },
  mainContent: {
    flex: 1, // Allow main content to take available space
    gap: 24,
    marginBottom: 24, // Add space before footer
  },
  titleSection: {
    alignItems: 'flex-start',
    gap: 24,
    paddingHorizontal: 8, // As per CSS Frame 1707480067
  },
  iconContainer: {
    width: 48,
    height: 52,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseIconSvg: {
    position: 'absolute',
    // Centered by default due to container style
  },
  overlayIconSvg: {
    position: 'absolute',
    right: 0, // Position overlay to the top-right
    top: 0,
  },
  titleText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 24, // 120%
    color: '#FFFFFF',
  },
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontSize: 14,
    color: '#FF4E57', // Error color
    marginTop: 8,
    textAlign: 'left',
  },
  detailsSection: {
    gap: 16,
    alignSelf: 'stretch',
  },
  infoBox: {
    padding: 18,
    gap: 24, // Gap between rows inside the box
    alignSelf: 'stretch',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19, // 120%
    color: '#888888',
  },
  detailValue: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19, // 120%
    color: '#FFFFFF',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align icon to top
    padding: 16,
    gap: 8,
    alignSelf: 'stretch',
  },
  warningText: {
    flex: 1, // Allow text to wrap
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17, // ~120%
    color: '#989898',
  },
  footer: {
    paddingHorizontal: 16, // Add horizontal padding to match Button's typical container
  },
  confirmButtonBase: {
    width: '100%',
    height: 49,
    borderRadius: 100, // Assuming a squircle-like button from Button component
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  confirmButtonActive: {
    backgroundColor: '#40FF00', // Active color from typical primary button
  },
  confirmButtonDisabled: {
    backgroundColor: '#A0A0A0', // Disabled color
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17, // 120%
    textAlign: 'center',
    color: '#000000',
  },
});
