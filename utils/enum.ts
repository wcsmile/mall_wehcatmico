export module EnumUtility {
    export enum BannerType {
        normal = 1,
        newCustomer = 2,
        oldCustomer = 3,
        noAttention = 4,
        attention = 5,
    }

    export enum OrderSource {
        doc = 0,
    }

    export enum OrderType {
        normal = 1,
        newCustomer = 2,
        voucher = 3,
        slowRecharge = 9
    }

    export enum BannerClickType {
        recvVoucher = 1,// 领券
        newCustomer = 2,// 新用户
        noAttention = 3,// 未关注
        friendImpression = 4,// 好友印象
        weekDiscount = 6// 每周特惠
    }
}